export type AdminAuthActionState = {
  attempt: number;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  message?: string;
  status: "idle" | "error";
  values?: {
    email?: string;
  };
};

export const INITIAL_ADMIN_AUTH_STATE: AdminAuthActionState = {
  attempt: 0,
  status: "idle",
};
