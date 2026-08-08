import { getFaqs } from "@/lib/data/faqs";

export const revalidate = 3600; // 1시간

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <section className="mx-auto max-w-5xl px-4 pt-24 pb-30 sm:px-6 lg:px-12 xl:pt-30">
      <h1 className="text-center mt-10 font-serif italic text-4xl text-neutral-400 tracking-widest md:tracking-[0.5em]">
        FAQ
      </h1>

      <div className="mt-18 divide-y divide-border">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group px-2 py-5 text-sm xl:text-base"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none font-medium">
              <span>Q. {faq.question}</span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 pr-2 flex text-muted-foreground">
              <span className="font-medium">A.</span>
              <p className="ml-1 whitespace-pre-line">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
