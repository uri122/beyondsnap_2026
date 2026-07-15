import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-screen max-w-full border-t border-border bg-muted/30 flex items-center p-10">

        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <Image src="/images/logo.png" alt="Beyond Snap Photography" width={300} height={80} />
        </div>

        <div className="border-l border-border ml-2 pl-8 py-2 text-xs leading-relaxed text-muted-foreground">
          <div>
            <p>상호명 : 비욘드스냅</p>
            <p>대표자 : 김종갑 &nbsp;|&nbsp; 사업자등록번호 : 108-17-65116</p>
            <p>주소 : 서울특별시 강남구 선릉로135길 19</p>
            <p>TEL : <a href="tel:025424933">02-542-4933</a> &nbsp;|&nbsp; E-mail : <a href="mailto:info@example.com">beyond-snap@naver.com</a></p>
            <p className="mt-3">&copy; {new Date().getFullYear()} Beyondsnap. All rights reserved.</p>
          </div>
        </div>

    </footer>
  );
}
