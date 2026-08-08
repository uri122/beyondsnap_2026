import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-screen max-w-full border-t border-border bg-muted/30 flex flex-col-reverse items-center px-4 py-6 sm:p-6 sm:flex-row lg:px-12 4xl:px-16">
      <div className="py-4">
        <Image
          src="/images/logo.png"
          alt="Beyond Snap Photography"
          width={467}
          height={132}
          quality={100}
          className="w-65 sm:w-55 md:w-75 2xl:w-78 4xl:w-82 dark:invert"
        />
      </div>

      <div className="py-2 text-xs leading-relaxed text-muted-foreground text-center sm:text-left sm:border-l sm:border-border sm:ml-4 sm:pl-6 2xl:ml-8 2xl:pl-10 4xl:ml-10 4xl:pl-13">
        <p>상호명 : 비욘드스냅</p>
        <p>대표자 : 김종갑 &nbsp;|&nbsp; 사업자등록번호 : 108-17-65116</p>
        <p>주소 : 서울특별시 강남구 선릉로135길 19</p>
        <p>
          TEL : <a href="tel:025424933">02-542-4933</a> &nbsp;|&nbsp; E-mail :{" "}
          <a href="mailto:beyond-snap@naver.com">beyond-snap@naver.com</a>
        </p>
        <p className="mt-3">
          &copy; {new Date().getFullYear()} Beyondsnap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
