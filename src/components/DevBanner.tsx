import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "dev_banner_dismissed_v1";

export default function DevBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative bg-[#0f1117] border-b border-violet-500/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 pr-8">
        <span className="hidden sm:inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 flex-shrink-0">
          <Icon name="Heart" size={12} className="text-violet-300" />
        </span>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed text-center">
          <span className="text-white font-medium">Сайт ещё растёт и развивается.</span>{" "}
          <span className="hidden sm:inline">Если что-то работает не так или есть идея — напишите в </span>
          <span className="sm:hidden">Есть идея или баг? Напишите в </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-support"))}
            className="text-violet-300 hover:text-violet-200 underline underline-offset-2 transition-colors font-medium"
          >
            поддержку
          </button>
          <span className="hidden md:inline">. Каждое сообщение помогает маркетплейсу бытовых услуг HandyMan становиться лучше.</span>
        </p>
      </div>
      <button
        onClick={handleClose}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
        aria-label="Закрыть"
      >
        <Icon name="X" size={14} />
      </button>
    </div>
  );
}