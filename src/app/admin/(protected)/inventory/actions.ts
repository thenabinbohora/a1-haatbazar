"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inventoryAdjustmentInputSchema } from "@/lib/validation/admin-management";

class InventoryActionError extends Error {
  constructor(readonly code: "validation" | "negative-stock") {
    super(code);
  }
}

function redirectWithError(error: unknown): never {
  if (error instanceof z.ZodError) {
    redirect("/admin/inventory?error=validation");
  }

  if (error instanceof InventoryActionError) {
    redirect(`/admin/inventory?error=${error.code}`);
  }

  redirect("/admin/inventory?error=failed");
}

export async function adjustInventoryAction(formData: FormData) {
  const admin = await requireAdmin();

  try {
    const input = inventoryAdjustmentInputSchema.parse({
      variantId: String(formData.get("variantId") ?? ""),
      quantityChange: String(formData.get("quantityChange") ?? ""),
      reason: String(formData.get("reason") ?? ""),
      note: String(formData.get("note") ?? ""),
    });

    await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: input.variantId },
        select: { stock: true },
      });

      if (!variant) {
        throw new InventoryActionError("validation");
      }

      const stockAfter = variant.stock + input.quantityChange;

      if (stockAfter < 0) {
        throw new InventoryActionError("negative-stock");
      }

      await tx.productVariant.update({
        where: { id: input.variantId },
        data: { stock: stockAfter },
      });

      await tx.inventoryLog.create({
        data: {
          variantId: input.variantId,
          userId: admin.id,
          changeType: input.quantityChange > 0 ? "RESTOCK" : "ADJUSTMENT",
          reason: input.reason,
          quantityChange: input.quantityChange,
          stockBefore: variant.stock,
          stockAfter,
          note: input.note ?? null,
        },
      });
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/inventory?success=updated");
}
