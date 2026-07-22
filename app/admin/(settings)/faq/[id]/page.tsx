import { notFound } from "next/navigation";
import { getFaqById } from "@/lib/data/faqs";
import { EditFaqForm } from "@/components/admin/EditFaqForm";

export default async function AdminFaqDetailPage({ params }: { params: { id: string } }) {
  const faq = await getFaqById(params.id);
  if (!faq) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl">FAQ 수정</h1>

      <div className="mt-8 max-w-2xl rounded-lg border border-border p-6">
        <EditFaqForm faq={faq} />
      </div>
    </div>
  );
}
