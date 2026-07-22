import { getFaqs } from "@/lib/data/faqs";
import { NewFaqForm } from "@/components/admin/NewFaqForm";
import { FaqList } from "@/components/admin/FaqList";

export default async function AdminFaqPage() {
  const faqs = await getFaqs();

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium">FAQ 관리</h1>

      <div className="mt-8 rounded-lg border border-border p-6">
        <h2 className="font-medium">새 FAQ 등록</h2>
        <div className="mt-4">
          <NewFaqForm nextSortOrder={faqs.length} />
        </div>
      </div>

      <FaqList faqs={faqs} />
    </div>
  );
}