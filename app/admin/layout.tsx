import Link from "next/link";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/galleries", label: "갤러리 관리" },
  { href: "/admin/products", label: "상품구성 관리" },
  { href: "/admin/faq", label: "FAQ 관리" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10">
      <aside className="w-48 shrink-0">
        <nav className="space-y-1 text-sm">
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
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
