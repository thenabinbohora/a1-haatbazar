"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerAddressSchema } from "@/lib/validation/customer";

class AccountActionError extends Error {
  constructor(readonly code: "not-found") {
    super(code);
  }
}

class AccountValidationError extends Error {
  constructor() {
    super("validation");
  }
}

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function parseAddressForm(formData: FormData) {
  return customerAddressSchema.parse({
    id: String(formData.get("id") ?? ""),
    label: String(formData.get("label") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    suburb: String(formData.get("suburb") ?? ""),
    state: String(formData.get("state") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "Australia"),
    isDefault: checkboxValue(formData, "isDefault"),
  });
}

function redirectAddressError(error: unknown): never {
  if (error instanceof z.ZodError) {
    redirect("/account/addresses?error=validation");
  }

  if (error instanceof AccountValidationError) {
    redirect("/account/addresses?error=validation");
  }

  if (error instanceof AccountActionError) {
    redirect(`/account/addresses?error=${error.code}`);
  }

  redirect("/account/addresses?error=failed");
}

export async function createAddressAction(formData: FormData) {
  const user = await requireCustomer("/account/addresses");

  try {
    const input = parseAddressForm(formData);

    await prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({ where: { userId: user.id, type: "SHIPPING" }, data: { isDefault: false } });
      }

      await tx.address.create({
        data: {
          userId: user.id,
          type: "SHIPPING",
          label: input.label ?? null,
          fullName: input.fullName,
          phone: input.phone,
          line1: input.line1,
          line2: input.line2 ?? null,
          suburb: input.suburb,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          isDefault: input.isDefault,
        },
      });
    });

    revalidatePath("/account/addresses");
  } catch (error) {
    redirectAddressError(error);
  }

  redirect("/account/addresses?success=created");
}

export async function updateAddressAction(formData: FormData) {
  const user = await requireCustomer("/account/addresses");

  try {
    const input = parseAddressForm(formData);

    if (!input.id) {
      throw new AccountValidationError();
    }

    await prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({ where: { id: input.id, userId: user.id }, select: { id: true } });

      if (!address) {
        throw new AccountActionError("not-found");
      }

      if (input.isDefault) {
        await tx.address.updateMany({ where: { userId: user.id, type: "SHIPPING" }, data: { isDefault: false } });
      }

      await tx.address.update({
        where: { id: input.id },
        data: {
          label: input.label ?? null,
          fullName: input.fullName,
          phone: input.phone,
          line1: input.line1,
          line2: input.line2 ?? null,
          suburb: input.suburb,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          isDefault: input.isDefault,
        },
      });
    });

    revalidatePath("/account/addresses");
  } catch (error) {
    redirectAddressError(error);
  }

  redirect("/account/addresses?success=updated");
}

export async function deleteAddressAction(formData: FormData) {
  const user = await requireCustomer("/account/addresses");
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/account/addresses?error=validation");
  }

  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account/addresses");
  redirect("/account/addresses?success=deleted");
}

export async function removeWishlistItemAction(formData: FormData) {
  const user = await requireCustomer("/wishlist");
  const productId = String(formData.get("productId") ?? "");

  if (!productId) {
    redirect("/wishlist?error=validation");
  }

  await prisma.wishlist.deleteMany({ where: { userId: user.id, productId } });
  revalidatePath("/wishlist");
  redirect("/wishlist?success=removed");
}
