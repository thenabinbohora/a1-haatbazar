"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { canTransitionOrderStatus } from "@/lib/admin/order-status";
import { prisma } from "@/lib/prisma";
import { orderStatusInputSchema } from "@/lib/validation/admin-management";

class OrderStatusActionError extends Error {
  constructor(readonly code: "transition" | "not-found") {
    super(code);
  }
}

function redirectWithError(error: unknown): never {
  if (error instanceof z.ZodError) {
    redirect("/admin/orders?error=validation");
  }

  if (error instanceof OrderStatusActionError) {
    redirect(`/admin/orders?error=${error.code}`);
  }

  redirect("/admin/orders?error=failed");
}

export async function updateOrderStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  let successPath = "/admin/orders";

  try {
    const input = orderStatusInputSchema.parse({
      orderId: String(formData.get("orderId") ?? ""),
      status: String(formData.get("status") ?? ""),
      paymentStatus: String(formData.get("paymentStatus") ?? ""),
    });
    const returnTo = String(formData.get("returnTo") ?? "/admin/orders");
    successPath = returnTo.startsWith("/admin/orders") ? returnTo : "/admin/orders";

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: {
          items: {
            select: {
              variantId: true,
              quantity: true,
              productName: true,
              variantName: true,
            },
          },
        },
      });

      if (!order) {
        throw new OrderStatusActionError("not-found");
      }

      if (!canTransitionOrderStatus(order.status, input.status)) {
        throw new OrderStatusActionError("transition");
      }

      await tx.order.update({
        where: { id: input.orderId },
        data: {
          status: input.status,
          paymentStatus: input.paymentStatus,
        },
      });

      if (input.status === "CANCELLED" && order.status !== "CANCELLED") {
        for (const item of order.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true },
          });

          if (!variant) {
            continue;
          }

          const stockAfter = variant.stock + item.quantity;

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: stockAfter },
          });

          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,
              userId: admin.id,
              changeType: "RELEASE",
              reason: "ORDER_CANCELLED",
              quantityChange: item.quantity,
              stockBefore: variant.stock,
              stockAfter,
              note: `Stock restored after cancelling order ${order.orderNumber}.`,
            },
          });
        }
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${input.orderId}`);
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");

  } catch (error) {
    redirectWithError(error);
  }

  redirect(`${successPath}${successPath.includes("?") ? "&" : "?"}success=updated`);
}
