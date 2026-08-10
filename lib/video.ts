// 유튜브/비메오 링크를 iframe에 넣을 수 있는 embed URL로 변환합니다.
// 지원하지 않는 형식이면 null — 호출부에서 "새 창에서 보기" 링크로 대체하세요.
export function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }

    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host === "tv.naver.com") {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const videoIndex = segments.indexOf("v");
      const id = videoIndex >= 0 ? segments[videoIndex + 1] : null;
      return id ? `https://tv.naver.com/embed/${id}` : null;
    }

    if (host === "tv.kakao.com" || host === "play-tv.kakao.com") {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const videoIndex = segments.indexOf("v");
      const id = videoIndex >= 0 ? segments[videoIndex + 1] : null;
      return id
        ? `https://play-tv.kakao.com/embed/player/cliplink/${id}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}
