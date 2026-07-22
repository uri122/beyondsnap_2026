import Link from "next/link";
import { GalleryComposer } from "@/components/admin/GalleryComposer";

export default function NewGalleryPage() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Link href="/admin/galleries" className="text-sm text-muted-foreground hover:underline">
          갤러리 관리
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">새 갤러리 등록</span>
      </div>
      <h1 className="mt-2 font-serif text-2xl">새 갤러리 등록</h1>

      <div className="mt-8">
        <GalleryComposer />
      </div>
    </div>
  );
}
