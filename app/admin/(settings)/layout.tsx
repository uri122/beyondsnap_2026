import Link from "next/link";
import { logoutAdmin } from "@/app/actions/auth";
import { redirect } from "next/navigation";

const ADMIN_NAV = [
  // { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/core", label: "기본 설정" },
  { href: "/admin/galleries", label: "Ceremony 관리" },
  { href: "/admin/films", label: "Films 관리" },
  { href: "/admin/products", label: "Products 관리" },
  { href: "/admin/faq", label: "FAQ 관리" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function handleLogout() {
    "use server";
    await logoutAdmin();
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 pt-10 pb-20">
      <aside className="w-50 shrink-0">
        <nav className="space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={handleLogout} className="mt-4">
          <button
            type="submit"
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
          >
            로그아웃
          </button>
        </form>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
