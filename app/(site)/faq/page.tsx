import { getFaqs } from "@/lib/data/faqs";

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <section className="mx-auto max-w-5xl px-4 py-30">
      <h1 className="my-10 text-center font-serif font-light italic text-4xl text-neutral-400 tracking-[0.5em] md:tracking-[1em]">FAQ</h1>

      <div className="mt-10 divide-y divide-border">
        {faqs.map((faq) => (
          <details key={faq.id} className="group py-5">
            <summary className="cursor-pointer list-none font-medium">Q. {faq.question}</summary>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">A. {faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
