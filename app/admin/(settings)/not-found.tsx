import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 font-serif text-xl">찾을 수 없는 항목이에요</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        삭제되었거나 잘못된 주소일 수 있어요.
      </p>
    </div>
  );
}
