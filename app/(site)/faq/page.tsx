import { getFaqs } from "@/lib/data/faqs";

export const revalidate = 3600; // 1시간

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <section className="mx-auto max-w-5xl px-4 pt-24 pb-30 sm:px-6 lg:px-12 xl:pt-30">
      <h1 className="text-center mt-10 font-serif italic text-4xl text-neutral-400 tracking-widest md:tracking-[0.5em]">
        FAQ
      </h1>

      <div className="mt-20 divide-y divide-border">
        {faqs.map((faq) => (
          <details key={faq.id} className="group py-5">
            <summary className="cursor-pointer list-none font-medium">
              Q. {faq.question}
            </summary>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">
              A. {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
