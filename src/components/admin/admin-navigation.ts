import type { AdminIconName } from "@/components/admin/admin-icons";

export type AdminNavigationItem = {
  href: string;
  icon: AdminIconName;
  label: string;
};

export type AdminNavigationGroup = {
  label: string;
  items: AdminNavigationItem[];
};

export const adminNavigationGroups: AdminNavigationGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", icon: "box", label: "Products" },
      { href: "/admin/categories", icon: "categories", label: "Categories" },
      { href: "/admin/inventory", icon: "inventory", label: "Inventory" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", icon: "orders", label: "Orders" },
      { href: "/admin/coupons", icon: "coupon", label: "Coupons" },
    ],
  },
  {
    label: "Storefront",
    items: [
      { href: "/admin/banners", icon: "banner", label: "Banners" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", icon: "settings", label: "Settings" },
    ],
  },
];

export const adminNavigationItems = adminNavigationGroups.flatMap(
  (group) => group.items,
);

export const adminQuickCreateItems = [
  { href: "/admin/products/new", icon: "box" as const, label: "Add product" },
  { href: "/admin/categories#new-category", icon: "categories" as const, label: "Create category" },
  { href: "/admin/coupons#new-coupon", icon: "coupon" as const, label: "Create coupon" },
  { href: "/admin/banners#new-banner", icon: "banner" as const, label: "Create banner" },
];
