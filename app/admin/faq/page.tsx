import { getFaqs } from "@/lib/data/faqs";

// FAQ CRUD도 NewGalleryForm과 동일 패턴 (faqs 테이블 insert/update)
export default async function AdminFaqPage() {
  const faqs = await getFaqs();

  return (
    <div>
      <h1 className="font-serif text-2xl">FAQ 관리</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        TODO: 새 FAQ 등록 폼 (NewGalleryForm과 동일 패턴으로 구현)
      </p>

      <div className="mt-8 divide-y divide-border">
        {faqs.map((faq) => (
          <div key={faq.id} className="py-4">
            <p className="font-medium">Q. {faq.question}</p>
            <p className="mt-1 text-sm text-muted-foreground">A. {faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
