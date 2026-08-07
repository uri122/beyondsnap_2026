import { getFaqs } from "@/lib/data/faqs";
import { NewFaqForm } from "@/components/admin/NewFaqForm";
import { FaqList } from "@/components/admin/FaqList";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const faqs = await getFaqs();

  return (
    <div>
      <h1 className="text-3xl font-semibold">FAQ 관리</h1>

      <div className="mt-8 rounded-lg border border-border p-6">
        <h2 className="font-medium text-xl">새 FAQ 등록</h2>
        <div className="mt-4">
          <NewFaqForm nextSortOrder={faqs.length} />
        </div>
      </div>

      <FaqList faqs={faqs} />
    </div>
  );
}
