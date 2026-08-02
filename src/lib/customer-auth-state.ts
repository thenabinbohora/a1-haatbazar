export type CustomerAuthField =
  | "email"
  | "name"
  | "password";

export type CustomerAuthActionState = {
  fieldErrors?: Partial<Record<CustomerAuthField, string>>;
  message?: string;
  status: "idle" | "error" | "success";
  values?: {
    email?: string;
    name?: string;
  };
};

export const INITIAL_CUSTOMER_AUTH_STATE: CustomerAuthActionState = {
  status: "idle",
};
