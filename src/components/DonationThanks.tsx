import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const DONATIONS_URL = "https://functions.poehali.dev/64a0e43a-4d64-4be5-bc69-90e6d3138e97";

export default function DonationThanks() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("donate") !== "ok") return;
    const id = localStorage.getItem("pending_donation_id");
    if (!id) return;

    fetch(DONATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check", donation_id: parseInt(id, 10) }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === "succeeded") {
          setShow(true);
          localStorage.removeItem("pending_donation_id");
          const url = new URL(window.location.href);
          url.searchParams.delete("donate");
          window.history.replaceState({}, "", url.toString());
        }
      })
      .catch(() => {});
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={() => setShow(false)}>
      <div className="bg-[#13161f] border border-pink-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/25 to-violet-600/25 border border-pink-500/40 flex items-center justify-center mx-auto mb-4">
          <Icon name="Heart" size={28} className="text-pink-400 fill-pink-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Спасибо!</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          Ваш вклад помогает HandyMan развиваться. Это значит для нас очень много.
        </p>
        <button
          onClick={() => setShow(false)}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
