import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";
const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

const POLL_INTERVAL = 30000;

export default function ChatFab() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [visible, setVisible] = useState(false);
  const masterIdRef = useRef<number | null>(null);

  const resolveMasterId = useCallback(async (): Promise<number | null> => {
    if (masterIdRef.current) return masterIdRef.current;
    const phone = localStorage.getItem("master_phone");
    if (!phone) return null;
    try {
      const res = await fetch(`${MASTER_URL}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      const id = data?.master?.id ?? null;
      if (id) masterIdRef.current = id;
      return id;
    } catch (_e) {
      return null;
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    const customerPhone = localStorage.getItem("customer_phone");
    const masterPhone = localStorage.getItem("master_phone");

    if (!customerPhone && !masterPhone) {
      setVisible(false);
      setUnread(0);
      return;
    }

    setVisible(true);
    let count = 0;

    if (customerPhone) {
      try {
        const res = await fetch(
          `${MY_ORDERS_URL}?action=unread&customer_phone=${encodeURIComponent(customerPhone)}`
        );
        const data = await res.json();
        count += data.unread ?? 0;
      } catch (_e) {
        // ignore
      }
    }

    if (masterPhone) {
      const masterId = await resolveMasterId();
      if (masterId) {
        try {
          const res = await fetch(`${MASTER_URL}?action=unread&master_id=${masterId}`);
          const data = await res.json();
          count += data.unread ?? 0;
        } catch (_e) {
          // ignore
        }
      }
    }

    setUnread(count);
  }, [resolveMasterId]);

  useEffect(() => {
    masterIdRef.current = null;
    fetchUnread();
    const interval = setInterval(fetchUnread, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnread, location.pathname]);

  const handleClick = () => {
    const masterPhone = localStorage.getItem("master_phone");
    const customerPhone = localStorage.getItem("customer_phone");
    if (masterPhone) {
      navigate("/master?tab=inquiries");
    } else if (customerPhone) {
      navigate("/cabinet?tab=chats");
    }
  };

  const isOnChatPage =
    (location.pathname.startsWith("/cabinet") && (location.search.includes("tab=chats") || location.search.includes("tab=inquiries") || !location.search.includes("tab="))) ||
    (location.pathname.startsWith("/master") && location.search.includes("tab=inquiries"));

  if (!visible || isOnChatPage) return null;

  return (
    <button
      onClick={handleClick}
      className="chat-fab-btn fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-violet-900/40 transition-all duration-200 hover:scale-105 text-sm font-medium"
      aria-label="Мои чаты"
    >
      <div className="relative">
        <Icon name="MessageCircle" size={18} />
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>
      <span>Чаты</span>
    </button>
  );
}