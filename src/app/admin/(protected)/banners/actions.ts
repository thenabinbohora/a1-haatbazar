"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bannerInputSchema } from "@/lib/validation/admin-management";

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function parseBannerForm(formData: FormData) {
  return bannerInputSchema.parse({
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    linkUrl: String(formData.get("linkUrl") ?? ""),
    placement: String(formData.get("placement") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
    isActive: checkboxValue(formData, "isActive"),
  });
}

function redirectWithError(error: unknown): never {
  if (error instanceof Error && error.message === "FORM_VALIDATION") {
    redirect("/admin/banners?error=validation");
  }

  if (error instanceof z.ZodError) {
    redirect("/admin/banners?error=validation");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      redirect("/admin/banners?error=unique");
    }

    if (error.code === "P2003") {
      redirect("/admin/banners?error=linked");
    }
  }

  redirect("/admin/banners?error=failed");
}

export async function createBannerAction(formData: FormData) {
  await requireAdmin();

  try {
    const input = parseBannerForm(formData);

    await prisma.banner.create({
      data: {
        title: input.title,
        subtitle: input.subtitle ?? null,
        imageUrl: input.imageUrl ?? null,
        linkUrl: input.linkUrl ?? null,
        placement: input.placement,
        sortOrder: input.sortOrder,
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
        isActive: input.isActive,
      },
    });

    revalidatePath("/admin/banners");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/banners?success=created");
}

export async function updateBannerAction(formData: FormData) {
  await requireAdmin();

  try {
    const input = parseBannerForm(formData);

    if (!input.id) {
      throw new Error("FORM_VALIDATION");
    }

    await prisma.banner.update({
      where: { id: input.id },
      data: {
        title: input.title,
        subtitle: input.subtitle ?? null,
        imageUrl: input.imageUrl ?? null,
        linkUrl: input.linkUrl ?? null,
        placement: input.placement,
        sortOrder: input.sortOrder,
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
        isActive: input.isActive,
      },
    });

    revalidatePath("/admin/banners");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/banners?success=updated");
}

export async function deleteBannerAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/banners?error=validation");
  }

  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath("/admin/banners");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/banners?success=deleted");
}
