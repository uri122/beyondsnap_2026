import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PRODUCTS | 비욘드스냅",
  description: "비욘드스냅 본식 촬영 상품과 추가 옵션 안내",
};

const PACKAGES = [
  {
    name: "good to know",
    price: "-",
    items: [
      "모든 촬영은 비욘드스냅 전속 작가가 진행합니다.",
      "모든 촬영은 신부대기실부터 원판촬영까지 진행됩니다.",
      "첫 예식은 예식 시작 110분 전, 일반 예식은 90분 전 도착합니다.",
      "원판(기념)촬영이 필수인 베뉴에서도 구성·비용은 동일합니다.",
      "부가세(VAT) 별도 금액입니다.",
    ],
    hasImage: false,
  },
  {
    name: "Main Snap",
    price: "KRW 100.0",
    items: ["1인 촬영", "14inch x 11inch 50p 1권 + 10inch x 8inch 50p 2권", "원본 + 편집본 링크로 전송"],
    hasImage: true,
  },
  {
    name: "iPhone Snap",
    price: "KRW 30.0",
    items: [
      "당일 원본 링크 전송 (사진·영상 500~600컷 내외)",
      "당일 폴라로이드 5장 전달",
      "작가Pick 보정본 15컷 + 감사카드 2컷 (3일 이내 전송)",
      "1인 촬영으로만 진행",
    ],
    hasImage: false,
  },
  {
    name: "Filming",
    price: "KRW 90.0",
    items: ["4K 2Camera 촬영", "원본 + FHD 하이라이트 15분 내외 제공", "1인 촬영으로만 진행"],
    hasImage: false,
  },
] as const;

const MAIN_SNAP_ADDONS = [
  { name: "작가 1인", price: "+ 40.0" },
  { name: "대표작가 지정", price: "+ 30.0" },
  { name: "수석작가 지정", price: "+ 20.0" },
  { name: "메이크업샵", price: "+ 30.0" },
  { name: "폐백실", price: "+ 20.0" },
  { name: "피로연장", price: "+ 10.0" },
  { name: "차량 하차씬", price: "+ 5.0" },
];

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-8xl px-4 py-30">
      <h1 className="my-10 text-center font-serif italic text-4xl text-neutral-400 tracking-[0.5em]">PRODUCTS</h1>

      <div className="pt-10 divide-y-2 divide-accent-rose-line">
        {PACKAGES.map((pkg, idx) => (
          <div
            key={pkg.name}
            className="grid grid-cols-1 gap-8 border-t-1 border-accent-rose-tint py-15 px-2 sm:py-20 sm:px-4 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[auto_1fr] md:gap-12"
          >
            {/* 타이틀 영역 */}
            <div className={`md:w-58 ${idx === 0 && "flex items-center"}`}>
              {idx === 0 ? (
                <p className="font-serif md:ml-6 italic text-accent-rose">
                  good to know
                </p>
              ) : (
                <>
                  <h2 className="mt-2 font-serif text-4xl text-neutral-700 before:content-[''] before:border-l-5 before:border-accent-rose before:pl-4">{pkg.name}</h2>
                  <p className="mt-4 px-3 sm:px-5 text-lg font-semibold text-neutral-400">
                    {pkg.price}
                  </p>
                </>
              )}
            </div>

            {/* 상세 구성 */}
            <div>
              {pkg.hasImage && (
                <div className="relative mb-10 aspect-[4/3] w-full max-w-md overflow-hidden shadow-sm">
                  <Image
                    src="/images/main-snap-album-01.jpg"
                    alt="비욘드스냅 main snap 패키지에 포함되는 앨범 실물"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              )}

              <ul className={`${idx===0? "text-xs space-y-1" : "text-base space-y-2"} leading-relaxed text-neutral-900`}>
                {pkg.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    {idx !== 0 && (
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-rose"
                      />
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* main snap 추가옵션 */}
              {pkg.hasImage && (
                <div
                  className="mt-15 p-2"
                >
                  <h3 className="text-base font-bold tracking-wide text-neutral-800 before:content-[''] before:border-l-5 before:border-accent-rose before:pl-3">
                    추가 옵션
                  </h3>

                  <dl className="mt-4 divide-y divide-accent-rose-line">
                    {MAIN_SNAP_ADDONS.map((addon) => (
                      <div
                        key={addon.name}
                        className="flex items-center justify-between gap-4 py-3 px-2 text-sm"
                      >
                        <dt className="text-neutral-900">{addon.name}</dt>
                        <dd className="shrink-0 text-neutral-500">{addon.price}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}