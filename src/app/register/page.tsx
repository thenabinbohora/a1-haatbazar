import { redirect } from "next/navigation";
import { safeInternalReturnPath } from "@/lib/safe-return-path";

type RegisterPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams({
    mode: "register",
    next: safeInternalReturnPath(params?.next),
  });

  redirect(`/login?${query.toString()}`);
}
