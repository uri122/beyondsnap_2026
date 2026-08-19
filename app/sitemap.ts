import type { MetadataRoute } from "next";
import { getPublishedGalleries } from "@/lib/data/galleries";
import { getPublishedFilms } from "@/lib/data/films";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ceremonies, films] = await Promise.all([
    getPublishedGalleries("dslr"),
    getPublishedFilms(),
  ]);

  const staticPages = [
    "",
    "/about",
    "/ceremony",
    "/films",
    "/products",
    "/faq",
  ].map((path) => ({
    url: `https://beyondsnap.co.kr${path}`,
    lastModified: new Date(),
  }));

  const ceremonyPages = ceremonies.map((g) => ({
    url: `https://beyondsnap.co.kr/ceremony/${g.slug}`,
    lastModified: new Date(g.created_at),
  }));

  const filmPages = films.map((f) => ({
    url: `https://beyondsnap.co.kr/films/${f.slug}`,
    lastModified: new Date(f.created_at),
  }));

  return [...staticPages, ...ceremonyPages, ...filmPages];
}
