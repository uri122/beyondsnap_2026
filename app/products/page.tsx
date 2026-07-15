import { getProducts } from "@/lib/data/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-serif text-3xl">상품구성</h1>

      <div className="mt-10 space-y-6">
        {products.map((product) => (
          <div key={product.id} className="rounded-lg border border-border p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-medium">{product.name}</h2>
              <p className="text-lg">{product.price.toLocaleString()}원</p>
            </div>
            {product.description && (
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            )}
            {product.items?.length > 0 && (
              <ul className="mt-4 list-inside list-disc text-sm text-muted-foreground">
                {product.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
