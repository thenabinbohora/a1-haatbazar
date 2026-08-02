import { redirect } from "next/navigation";
import { safeInternalReturnPath } from "@/lib/safe-return-path";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams({
    mode: "forgot",
    next: safeInternalReturnPath(params?.next),
  });

  redirect(`/login?${query.toString()}`);
}
