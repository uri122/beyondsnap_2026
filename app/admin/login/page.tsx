import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const isValidSession = await verifySessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (isValidSession) {
    redirect("/admin/core");
  }

  return <LoginForm />;
}
