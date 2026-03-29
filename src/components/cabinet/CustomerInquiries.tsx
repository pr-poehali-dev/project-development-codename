import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import ChatModal from "@/components/chat/ChatModal";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";

interface Inquiry {
  id: number;
  master_id: number;
  service_id: number | null;
  contact_name: string;
  message: string;
  is_read: boolean;
  deal_status: "pending" | "deal" | "no_deal";
  master_deal_confirmed: boolean;
  customer_deal_confirmed: boolean;
  master_contacts: { email: string } | null;
  created_at: string;
  master_name: string;
  master_city: string;
  master_category: string;
  avatar_color: string;
  service_title: string | null;
}

interface CustomerInquiriesProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onUnreadChange?: (count: number) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

function getLastSeenKey(inquiryId: number) {
  return `chat_last_seen_${inquiryId}`;
}

function getLastSeenMsgId(inquiryId: number): number {
  return parseInt(localStorage.getItem(getLastSeenKey(inquiryId)) || "0", 10);
}

function setLastSeenMsgId(inquiryId: number, msgId: number) {
  localStorage.setItem(getLastSeenKey(inquiryId), String(msgId));
}

export default function CustomerInquiries({ customerName, customerEmail, customerPhone, onUnreadChange }: CustomerInquiriesProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInquiry, setChatInquiry] = useState<Inquiry | null>(null);
  // unread[inquiryId] = число непрочитанных сообщений от мастера
  const [unread, setUnread] = useState<Record<number, number>>({});

  const loadInquiries = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(MY_ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_customer_inquiries", customer_email: customerEmail, customer_phone: customerPhone }),
      });
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } finally { if (showLoader) setLoading(false); }
  };

  const checkUnread = useCallback(async (inquiryList: Inquiry[]) => {
    const newUnread: Record<number, number> = {};
    await Promise.all(inquiryList.map(async (inq) => {
      try {
        const res = await fetch(`${MY_ORDERS_URL}?inquiry_id=${inq.id}`);
        const data = await res.json();
        const messages: { id: number; sender_role: string }[] = data.messages || [];
        const lastSeen = getLastSeenMsgId(inq.id);
        const unreadCount = messages.filter(m => m.sender_role === "master" && m.id > lastSeen).length;
        newUnread[inq.id] = unreadCount;
      } catch { newUnread[inq.id] = 0; }
    }));
    setUnread(newUnread);
    const total = Object.values(newUnread).reduce((a, b) => a + b, 0);
    onUnreadChange?.(total);
  }, [onUnreadChange]);

  useEffect(() => {
    loadInquiries(true);
    const interval = setInterval(() => loadInquiries(false), 15000);
    return () => clearInterval(interval);
  }, [customerEmail, customerPhone]);

  useEffect(() => {
    if (inquiries.length === 0) return;
    checkUnread(inquiries);
    const interval = setInterval(() => checkUnread(inquiries), 10000);
    return () => clearInterval(interval);
  }, [inquiries, checkUnread]);

  const openChat = (inq: Inquiry) => {
    // Помечаем все сообщения как прочитанные
    fetch(`${MY_ORDERS_URL}?inquiry_id=${inq.id}`)
      .then(r => r.json())
      .then(data => {
        const messages: { id: number }[] = data.messages || [];
        if (messages.length > 0) {
          const maxId = Math.max(...messages.map(m => m.id));
          setLastSeenMsgId(inq.id, maxId);
        }
      });
    setUnread(prev => {
      const next = { ...prev, [inq.id]: 0 };
      const total = Object.values(next).reduce((a, b) => a + b, 0);
      onUnreadChange?.(total);
      return next;
    });
    setChatInquiry(inq);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Мои обращения</h2>
          <p className="text-gray-500 text-sm mt-0.5">Мастера, которым вы написали напрямую</p>
        </div>
        {inquiries.length > 0 && (
          <span className="text-gray-500 text-sm">{inquiries.length} {inquiries.length === 1 ? "обращение" : inquiries.length < 5 ? "обращения" : "обращений"}</span>
        )}
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageSquare" size={28} className="text-gray-600" />
          </div>
          <p className="text-gray-500 text-lg">Обращений пока нет</p>
          <p className="text-gray-600 text-sm mt-1">Напишите мастеру с его страницы профиля</p>
          <a href="/">
            <Button className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">Найти мастера</Button>
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => {
            const unreadCount = unread[inq.id] || 0;
            return (
              <div
                key={inq.id}
                className={`border rounded-2xl p-4 transition-all ${unreadCount > 0 ? "bg-violet-600/8 border-violet-500/30" : "bg-white/4 border-white/8 hover:border-white/12"}`}
              >
                <div className="flex items-start gap-4">
                  <a href={`/master-page?id=${inq.master_id}`} className="flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                      style={{ background: `linear-gradient(135deg, ${inq.avatar_color}, #4f46e5)` }}
                    >
                      {inq.master_name?.[0]?.toUpperCase()}
                    </div>
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <a href={`/master-page?id=${inq.master_id}`} className="text-white font-semibold text-sm hover:text-violet-300 transition-colors">
                          {inq.master_name}
                        </a>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {inq.master_category && (
                            <span className="text-violet-400 text-xs">{inq.master_category}</span>
                          )}
                          {inq.master_city && (
                            <span className="text-gray-600 text-xs flex items-center gap-0.5">
                              <Icon name="MapPin" size={10} />{inq.master_city}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {unreadCount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-medium">
                            {unreadCount} новых
                          </span>
                        )}
                        <span className="text-gray-600 text-xs">{formatDate(inq.created_at)}</span>
                      </div>
                    </div>

                    {inq.service_title && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon name="Briefcase" size={11} className="text-violet-400" />
                        <span className="text-violet-300 text-xs">{inq.service_title}</span>
                      </div>
                    )}

                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">«{inq.message}»</p>

                    {inq.deal_status === "deal" && inq.master_contacts && (
                      <div className="mb-3 bg-emerald-600/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                        <p className="text-emerald-400 text-xs font-semibold mb-1 flex items-center gap-1">
                          <Icon name="CheckCircle" size={12} /> Договорились
                        </p>
                        {inq.master_contacts.email && (
                          <p className="text-gray-300 text-xs">✉️ {inq.master_contacts.email}</p>
                        )}
                      </div>
                    )}
                    {inq.deal_status === "no_deal" && (
                      <div className="mb-3 bg-red-600/8 border border-red-500/15 rounded-lg px-3 py-2">
                        <p className="text-red-400 text-xs flex items-center gap-1">
                          <Icon name="XCircle" size={12} /> Не договорились
                        </p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={() => openChat(inq)}
                      className={`text-xs h-8 px-4 gap-1.5 relative ${unreadCount > 0 ? "bg-amber-500 hover:bg-amber-400 text-white" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"}`}
                    >
                      <Icon name="MessageSquare" size={13} />
                      {unreadCount > 0 ? `Ответил мастер (${unreadCount})` : "Чат с мастером"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {chatInquiry && (
        <ChatModal
          inquiryId={chatInquiry.id}
          myRole="customer"
          myName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          partnerName={chatInquiry.master_name}
          partnerCategory={chatInquiry.master_category}
          serviceTitle={chatInquiry.service_title || undefined}
          onClose={() => setChatInquiry(null)}
          onDealDone={() => loadInquiries(false)}
        />
      )}
    </div>
  );
}