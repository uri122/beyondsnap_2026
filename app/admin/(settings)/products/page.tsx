import { getProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium">상품구성 관리</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        TODO: 새 패키지 등록 폼 (NewGalleryForm과 동일 패턴으로 구현)
      </p>

      <div className="mt-8 divide-y divide-border">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between py-4"
          >
            <p>{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {product.price.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
