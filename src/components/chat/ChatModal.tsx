import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";
const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Message {
  id: number;
  inquiry_id: number;
  sender_role: "customer" | "master";
  sender_name: string;
  text: string;
  created_at: string;
}

interface DealContacts {
  phone?: string | null;
  email?: string | null;
  name?: string | null;
  master_name?: string | null;
  master_email?: string | null;
}

interface ChatModalProps {
  inquiryId: number;
  myRole: "customer" | "master";
  myName: string;
  masterId?: number;
  masterName?: string;
  customerEmail?: string;
  customerPhone?: string;
  partnerName: string;
  partnerCategory?: string;
  serviceTitle?: string;
  onClose: () => void;
  onDealDone?: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function ChatModal({
  inquiryId, myRole, myName, masterId, masterName, customerEmail, customerPhone,
  partnerName, partnerCategory, serviceTitle, onClose, onDealDone
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [dealStatus, setDealStatus] = useState<"pending" | "deal" | "no_deal">("pending");
  const [masterDealConfirmed, setMasterDealConfirmed] = useState(false);
  const [customerDealConfirmed, setCustomerDealConfirmed] = useState(false);
  const [contacts, setContacts] = useState<DealContacts | null>(null);
  const [dealLoading, setDealLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API_URL = myRole === "customer" ? MY_ORDERS_URL : MASTER_URL;

  const fetchMessages = async () => {
    try {
      let res;
      if (myRole === "customer") {
        res = await fetch(MY_ORDERS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_messages", inquiry_id: inquiryId }),
        });
      } else {
        res = await fetch(`${MASTER_URL}?inquiry_id=${inquiryId}`);
      }
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
      if (data.deal_status) setDealStatus(data.deal_status);
      if (data.master_deal_confirmed !== undefined) setMasterDealConfirmed(data.master_deal_confirmed);
      if (data.customer_deal_confirmed !== undefined) setCustomerDealConfirmed(data.customer_deal_confirmed);
      if (data.contacts) setContacts(data.contacts);
    } catch (_e) { /* ignore */ }
  };

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [inquiryId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      const body: Record<string, unknown> = { action: "send_message", inquiry_id: inquiryId, sender_name: myName, text: text.trim() };
      if (myRole === "customer") body.sender_role = "customer";
      const res = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.error) { setSendError(data.error); return; }
      setText("");
      await fetchMessages();
    } finally { setSending(false); }
  };

  const handleDeal = async () => {
    setDealLoading(true);
    try {
      let body: Record<string, unknown>;
      if (myRole === "master") {
        body = { action: "confirm_deal", inquiry_id: inquiryId, master_id: masterId };
        const res = await fetch(MASTER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.error) { alert(data.error); return; }
        if (data.deal_done) { setDealStatus("deal"); setContacts(data.contacts); onDealDone?.(); }
        else { setMasterDealConfirmed(true); }
      } else {
        body = { action: "confirm_deal", inquiry_id: inquiryId, customer_email: customerEmail, customer_phone: customerPhone };
        const res = await fetch(MY_ORDERS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.error) { alert(data.error); return; }
        if (data.deal_done) { setDealStatus("deal"); setContacts(data.contacts); onDealDone?.(); }
        else { setCustomerDealConfirmed(true); }
      }
      await fetchMessages();
    } finally { setDealLoading(false); }
  };

  const handleRejectDeal = async () => {
    if (!confirm("Отметить как «не договорились»?")) return;
    setDealLoading(true);
    try {
      const url = myRole === "master" ? MASTER_URL : MY_ORDERS_URL;
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject_deal", inquiry_id: inquiryId }) });
      setDealStatus("no_deal");
      setMasterDealConfirmed(false);
      setCustomerDealConfirmed(false);
    } finally { setDealLoading(false); }
  };

  const myConfirmed = myRole === "master" ? masterDealConfirmed : customerDealConfirmed;
  const partnerConfirmed = myRole === "master" ? customerDealConfirmed : masterDealConfirmed;

  let lastDate = "";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center font-bold text-violet-400 text-sm">
              {partnerName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{partnerName}</p>
              <p className="text-gray-500 text-xs">{partnerCategory || serviceTitle || "Чат"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {serviceTitle && (
          <div className="px-5 py-2.5 bg-violet-600/8 border-b border-white/6 flex-shrink-0">
            <p className="text-violet-300 text-xs flex items-center gap-1.5">
              <Icon name="Briefcase" size={12} />
              {serviceTitle}
            </p>
          </div>
        )}

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {/* Статус договорённости — прокручивается вместе с чатом */}
          {dealStatus === "deal" ? (
            <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3">
              <p className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                <Icon name="CheckCircle" size={16} /> Договорились!
              </p>
              {contacts && (
                <div className="mt-2 text-sm text-gray-300 space-y-1">
                  {myRole === "master" && contacts.name && <p>👤 {contacts.name}</p>}
                  {myRole === "master" && contacts.phone && <p>📞 {contacts.phone}</p>}
                  {myRole === "master" && contacts.email && <p>✉️ {contacts.email}</p>}
                  {myRole === "customer" && contacts.master_name && <p>👤 {contacts.master_name}</p>}
                  {myRole === "customer" && contacts.master_email && <p>✉️ {contacts.master_email}</p>}
                </div>
              )}
            </div>
          ) : dealStatus === "no_deal" ? (
            <div className="bg-red-600/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <Icon name="XCircle" size={15} /> Не договорились
              </p>
            </div>
          ) : (
            <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-xs mb-2 flex items-center gap-1.5">
                <Icon name="Lock" size={12} className="text-amber-400" />
                Контакты откроются только после взаимного подтверждения
              </p>
              <div className="flex gap-2 flex-wrap">
                {!myConfirmed && (
                  <Button
                    size="sm"
                    onClick={handleDeal}
                    disabled={dealLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3 gap-1.5"
                  >
                    <Icon name="Handshake" size={13} /> Договорились
                  </Button>
                )}
                {myConfirmed && !partnerConfirmed && (
                  <span className="text-xs text-amber-400 flex items-center gap-1.5 py-1">
                    <Icon name="Clock" size={12} /> Вы подтвердили — ждём {partnerName}
                  </span>
                )}
                {partnerConfirmed && !myConfirmed && (
                  <span className="text-xs text-violet-400 flex items-center gap-1.5 py-1">
                    <Icon name="Bell" size={12} /> {partnerName} подтвердил(а) — подтвердите и вы
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRejectDeal}
                  disabled={dealLoading}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8 px-3 gap-1"
                >
                  <Icon name="X" size={12} /> Не договорились
                </Button>
              </div>
            </div>
          )}
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-sm">
              <Icon name="MessageSquare" size={28} className="mx-auto mb-2 opacity-30" />
              Начните общение
            </div>
          )}
          {messages.map((msg) => {
            const msgDate = formatDate(msg.created_at);
            const showDate = msgDate !== lastDate;
            lastDate = msgDate;
            const isMe = msg.sender_role === myRole;
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center my-2">
                    <span className="text-[10px] text-gray-600 bg-white/4 px-2 py-0.5 rounded-full">{msgDate}</span>
                  </div>
                )}
                <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe ? "bg-violet-600 text-white rounded-br-sm" : "bg-white/8 text-gray-100 rounded-bl-sm"
                  }`}>
                    {!isMe && <p className="text-[10px] text-violet-400 font-medium mb-1">{msg.sender_name}</p>}
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-violet-200" : "text-gray-500"} text-right`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Ввод */}
        {dealStatus !== "deal" && (
          <div className="px-4 pb-3 pt-2 border-t border-white/8 flex-shrink-0">
            {sendError && (
              <p className="text-amber-400 text-xs mb-2 flex items-start gap-1.5">
                <Icon name="AlertCircle" size={12} className="mt-0.5 flex-shrink-0" />
                {sendError}
              </p>
            )}
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); if (sendError) setSendError(""); }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as React.FormEvent); } }}
                placeholder="Написать сообщение..."
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                style={{ maxHeight: "100px", overflowY: "auto" }}
              />
              <Button type="submit" disabled={sending || !text.trim()} className="bg-violet-600 hover:bg-violet-500 text-white h-10 w-10 p-0 rounded-xl flex-shrink-0">
                <Icon name="Send" size={16} />
              </Button>
            </form>
          </div>
        )}
        {dealStatus === "deal" && (
          <div className="px-5 py-3 border-t border-white/8 text-center text-gray-500 text-xs flex-shrink-0">
            Чат закрыт — обменяйтесь контактами напрямую
          </div>
        )}
      </div>
    </div>
  );
}