"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponInputSchema } from "@/lib/validation/admin-management";

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function parseCouponForm(formData: FormData) {
  return couponInputSchema.parse({
    id: String(formData.get("id") ?? ""),
    code: String(formData.get("code") ?? ""),
    name: String(formData.get("name") ?? ""),
    type: String(formData.get("type") ?? ""),
    value: String(formData.get("value") ?? ""),
    minimumSubtotal: String(formData.get("minimumSubtotal") ?? ""),
    maxDiscount: String(formData.get("maxDiscount") ?? ""),
    usageLimit: String(formData.get("usageLimit") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    expiresAt: String(formData.get("expiresAt") ?? ""),
    isActive: checkboxValue(formData, "isActive"),
  });
}

function redirectWithError(error: unknown): never {
  if (error instanceof Error && error.message === "FORM_VALIDATION") {
    redirect("/admin/coupons?error=validation");
  }

  if (error instanceof z.ZodError) {
    redirect("/admin/coupons?error=validation");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      redirect("/admin/coupons?error=unique");
    }

    if (error.code === "P2003") {
      redirect("/admin/coupons?error=linked");
    }
  }

  redirect("/admin/coupons?error=failed");
}

export async function createCouponAction(formData: FormData) {
  await requireAdmin();

  try {
    const input = parseCouponForm(formData);

    await prisma.coupon.create({
      data: {
        code: input.code,
        name: input.name,
        type: input.type,
        value: input.value,
        minimumSubtotal: input.minimumSubtotal ?? null,
        maxDiscount: input.maxDiscount ?? null,
        usageLimit: input.usageLimit ?? null,
        startsAt: input.startsAt ?? null,
        expiresAt: input.expiresAt ?? null,
        isActive: input.isActive,
      },
    });

    revalidatePath("/admin/coupons");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/coupons?success=created");
}

export async function updateCouponAction(formData: FormData) {
  await requireAdmin();

  try {
    const input = parseCouponForm(formData);

    if (!input.id) {
      throw new Error("FORM_VALIDATION");
    }

    await prisma.coupon.update({
      where: { id: input.id },
      data: {
        code: input.code,
        name: input.name,
        type: input.type,
        value: input.value,
        minimumSubtotal: input.minimumSubtotal ?? null,
        maxDiscount: input.maxDiscount ?? null,
        usageLimit: input.usageLimit ?? null,
        startsAt: input.startsAt ?? null,
        expiresAt: input.expiresAt ?? null,
        isActive: input.isActive,
      },
    });

    revalidatePath("/admin/coupons");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/coupons?success=updated");
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/coupons?error=validation");
  }

  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/coupons?success=deleted");
}
