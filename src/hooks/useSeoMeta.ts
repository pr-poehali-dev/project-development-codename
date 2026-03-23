import { useEffect } from "react";

export function useSeoMeta(title: string, description: string, canonical?: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);

    const url = canonical || window.location.href.split("?")[0];
    setMeta('meta[property="og:url"]', url);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);

    return () => {
      const l = document.querySelector('link[rel="canonical"]');
      if (l) l.remove();
    };
  }, [title, description, canonical]);
}