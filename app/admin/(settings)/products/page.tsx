import { getProducts } from "@/lib/data/products";

// 상품구성 CRUD는 갤러리 관리(components/admin/NewGalleryForm.tsx)와 동일한 패턴으로
// "use client" 폼 컴포넌트를 만들어 products 테이블에 insert/update 하면 됩니다.
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
          <div key={product.id} className="flex items-center justify-between py-4">
            <p>{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.price.toLocaleString()}원</p>
          </div>
        ))}
      </div>
    </div>
  );
}
