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

interface ChatModalProps {
  inquiryId: number;
  myRole: "customer" | "master";
  myName: string;
  partnerName: string;
  partnerCategory?: string;
  serviceTitle?: string;
  onClose: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function ChatModal({ inquiryId, myRole, myName, partnerName, partnerCategory, serviceTitle, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API_URL = myRole === "customer" ? MY_ORDERS_URL : MASTER_URL;

  const fetchMessages = async () => {
    const res = await fetch(`${API_URL}?inquiry_id=${inquiryId}`);
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
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
    try {
      const body: Record<string, unknown> = { action: "send_message", inquiry_id: inquiryId, sender_name: myName, text: text.trim() };
      if (myRole === "customer") body.sender_role = "customer";
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setText("");
      await fetchMessages();
    } finally { setSending(false); }
  };

  let lastDate = "";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
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
                    isMe
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-white/8 text-gray-100 rounded-bl-sm"
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
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-white/8 flex items-end gap-2 flex-shrink-0">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
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
    </div>
  );
}
