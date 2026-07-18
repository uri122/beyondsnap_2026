import { getAllGalleries } from "@/lib/data/galleries";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic"; // 관리자 페이지는 항상 최신 데이터로

export default async function AdminDashboardPage() {
  const galleries = await getAllGalleries();

  return (
    <div>
      <h1 className="font-serif text-2xl">대시보드</h1>

      {!isSupabaseConfigured && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Supabase가 아직 연결되지 않아 더미 데이터로 화면만 보여주고 있어요. 등록/수정 기능은
          .env.local 설정 후 동작합니다.
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">등록된 갤러리</p>
          <p className="mt-2 text-3xl font-medium">{galleries.length}</p>
        </div>
      </div>
    </div>
  );
}