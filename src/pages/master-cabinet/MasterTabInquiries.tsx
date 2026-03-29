import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import ChatModal from "@/components/chat/ChatModal";

const MASTER_URL = "https://functions.poehali.dev/de274bd5-3f08-42d8-9aac-b373bb34b900";

interface Inquiry {
  id: number;
  service_id: number | null;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  message: string;
  is_read: boolean;
  deal_status: "pending" | "deal" | "no_deal";
  master_deal_confirmed: boolean;
  customer_deal_confirmed: boolean;
  created_at: string;
}

interface MasterTabInquiriesProps {
  inquiries: Inquiry[];
  masterName: string;
  masterId: number;
  onRefresh?: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export default function MasterTabInquiries({ inquiries, masterName, masterId, onRefresh }: MasterTabInquiriesProps) {
  const [chatInquiry, setChatInquiry] = useState<Inquiry | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (inquiryId: number, contactName: string) => {
    if (!confirm(`Удалить переписку с ${contactName}? Это действие нельзя отменить.`)) return;
    setDeletingId(inquiryId);
    try {
      await fetch(MASTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_inquiry", inquiry_id: inquiryId, master_id: masterId }),
      });
      onRefresh?.();
    } finally {
      setDeletingId(null);
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Icon name="MessageSquare" size={32} className="mx-auto mb-3 opacity-40" />
        <p>Обращений пока нет</p>
        <p className="text-sm text-gray-600 mt-1">Здесь появятся клиенты, которые написали вам напрямую</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className={`rounded-xl p-4 border transition-all ${inq.is_read ? "bg-white/4 border-white/8" : "bg-violet-600/8 border-violet-500/30"}`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center font-bold text-violet-400 text-sm flex-shrink-0">
                  {inq.contact_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{inq.contact_name}</p>
                  <p className="text-gray-600 text-xs">{formatDate(inq.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {inq.deal_status === "deal" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Договорились</span>
                )}
                {inq.deal_status === "no_deal" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Не договорились</span>
                )}
                {!inq.is_read && inq.deal_status === "pending" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Новое</span>
                )}
                <button
                  onClick={() => handleDelete(inq.id, inq.contact_name)}
                  disabled={deletingId === inq.id}
                  className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                  title="Удалить переписку"
                >
                  <Icon name={deletingId === inq.id ? "Loader" : "Trash2"} size={14} className={deletingId === inq.id ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-3 pl-10">{inq.message}</p>

            <div className="flex flex-wrap items-center gap-3 pl-10">
              {inq.deal_status === "deal" ? (
                <div className="flex flex-wrap gap-3">
                  {inq.contact_phone && (
                    <a href={`tel:${inq.contact_phone}`} className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                      <Icon name="Phone" size={13} />
                      {inq.contact_phone}
                    </a>
                  )}
                  {inq.contact_email && (
                    <a href={`mailto:${inq.contact_email}`} className="flex items-center gap-1.5 text-gray-400 text-xs hover:text-gray-300 transition-colors">
                      <Icon name="Mail" size={12} />
                      {inq.contact_email}
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                  <Icon name="Lock" size={11} className="text-amber-500/70" />
                  Контакты откроются после взаимного подтверждения
                </div>
              )}
              <Button
                size="sm"
                onClick={() => setChatInquiry(inq)}
                className="bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs h-7 px-3 gap-1.5"
              >
                <Icon name="MessageSquare" size={12} />
                {inq.deal_status === "pending" ? "Написать" : "Открыть чат"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {chatInquiry && (
        <ChatModal
          inquiryId={chatInquiry.id}
          myRole="master"
          myName={masterName}
          masterId={masterId}
          partnerName={chatInquiry.contact_name}
          onClose={() => setChatInquiry(null)}
          onDealDone={() => onRefresh?.()}
        />
      )}
    </>
  );
}