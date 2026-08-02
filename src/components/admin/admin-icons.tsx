import type { SVGProps } from "react";

export type AdminIconName =
  | "activity"
  | "banner"
  | "bell"
  | "box"
  | "calendar"
  | "categories"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "coupon"
  | "dashboard"
  | "external"
  | "inventory"
  | "menu"
  | "orders"
  | "plus"
  | "refresh"
  | "search"
  | "settings"
  | "sign-out"
  | "store"
  | "trend"
  | "user";

const paths: Record<AdminIconName, React.ReactNode> = {
  activity: <><path d="M4 12h3l2-6 4 12 2-6h5" /></>,
  banner: <><rect height="15" rx="2" width="18" x="3" y="4.5" /><path d="m6.5 15 3.2-3.5 2.6 2.5 2.2-2.4 3 3.4" /><circle cx="8" cy="8.5" r="1" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 16 18 16 18 9Z" /><path d="M10 21h4" /></>,
  box: <><path d="m4 7.5 8-4 8 4-8 4-8-4Z" /><path d="M4 7.5v9l8 4 8-4v-9M12 11.5v9" /></>,
  calendar: <><rect height="17" rx="2" width="18" x="3" y="4" /><path d="M8 2v4M16 2v4M3 9h18" /></>,
  categories: <><rect height="7" rx="1.5" width="7" x="3" y="3" /><rect height="7" rx="1.5" width="7" x="14" y="3" /><rect height="7" rx="1.5" width="7" x="3" y="14" /><rect height="7" rx="1.5" width="7" x="14" y="14" /></>,
  "chevron-down": <path d="m7 9.5 5 5 5-5" />,
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  coupon: <><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8Z" /><path d="M12 7v2M12 11v2M12 15v2" /></>,
  dashboard: <><rect height="7" rx="1.5" width="7" x="3" y="3" /><rect height="11" rx="1.5" width="7" x="14" y="3" /><rect height="11" rx="1.5" width="7" x="3" y="13" /><rect height="7" rx="1.5" width="7" x="14" y="17" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
  inventory: <><path d="M4 9h16v11H4zM3 4h18v5H3z" /><path d="M9 13h6" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  orders: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 1-2-5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  "sign-out": <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" /><path d="m15 8 4 4-4 4M19 12H8" /></>,
  store: <><path d="M4 10v10h16V10" /><path d="M3 4h18l-1.5 6a3 3 0 0 1-5 1 3 3 0 0 1-5 0 3 3 0 0 1-5-1L3 4Z" /><path d="M9 20v-5h6v5" /></>,
  trend: <><path d="M4 18 10 12l4 3 6-8" /><path d="M15 7h5v5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
};

export function AdminIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: AdminIconName }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
