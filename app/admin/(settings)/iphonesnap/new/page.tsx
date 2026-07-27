import Link from "next/link";
import { GalleryComposer } from "@/components/admin/GalleryComposer";

export default function NewIphoneSnapPage() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/iphonesnap"
          className="text-sm text-muted-foreground hover:underline"
        >
          아이폰스냅 관리
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">새 글 등록</span>
      </div>

      <h1 className="mt-5 text-2xl font-semibold">새 글 등록</h1>

      <div className="mt-8">
        <GalleryComposer snapType="iphone" />
      </div>
    </div>
  );
}
