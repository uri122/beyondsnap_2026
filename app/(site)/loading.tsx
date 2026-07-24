export default function SiteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4"
    >
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <span className="sr-only">페이지를 불러오는 중입니다</span>
    </div>
  );
}
