"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/validation/admin-management";

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function parseCategoryForm(formData: FormData) {
  return categoryInputSchema.parse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    parentId: String(formData.get("parentId") ?? ""),
    isFeatured: checkboxValue(formData, "isFeatured"),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
  });
}

function redirectWithError(error: unknown): never {
  if (error instanceof Error && error.message === "FORM_VALIDATION") {
    redirect("/admin/categories?error=validation");
  }

  if (error instanceof z.ZodError) {
    redirect("/admin/categories?error=validation");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      redirect("/admin/categories?error=unique");
    }

    if (error.code === "P2003") {
      redirect("/admin/categories?error=linked");
    }
  }

  redirect("/admin/categories?error=failed");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  try {
    const input = parseCategoryForm(formData);

    await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        parentId: input.parentId ?? null,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/categories?success=created");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  try {
    const input = parseCategoryForm(formData);

    if (!input.id || input.parentId === input.id) {
      throw new Error("FORM_VALIDATION");
    }

    await prisma.category.update({
      where: { id: input.id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        parentId: input.parentId ?? null,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/categories?success=updated");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/categories?error=validation");
  }

  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
  } catch (error) {
    redirectWithError(error);
  }

  redirect("/admin/categories?success=deleted");
}
