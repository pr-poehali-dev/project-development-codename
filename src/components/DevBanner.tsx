import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "dev_banner_dismissed_v1";

export default function DevBanner() {
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 40) {
        setHidden(false);
      } else if (y > lastY.current + 4) {
        setHidden(true);
      } else if (y < lastY.current - 4) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible]);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={`relative bg-[#0f1117] border-b border-violet-500/30 px-3 overflow-hidden transition-all duration-300 ease-out ${hidden ? "max-h-0 py-0 border-b-0 opacity-0" : "max-h-12 py-1.5 opacity-100"}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 pr-7">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 flex-shrink-0">
          <Icon name="Heart" size={10} className="text-violet-300" />
        </span>
        <p className="text-[11px] sm:text-xs text-gray-300 text-center truncate">
          <span className="text-white font-medium">Сайт развивается.</span>{" "}
          <span className="hidden sm:inline">Идея или баг? Напишите в </span>
          <span className="sm:hidden">Есть идея? </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-support"))}
            className="text-violet-300 hover:text-violet-200 underline underline-offset-2 transition-colors font-medium"
          >
            поддержку
          </button>
        </p>
      </div>
      <button
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
        aria-label="Закрыть"
      >
        <Icon name="X" size={12} />
      </button>
    </div>
  );
}