import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import ChatModal from "@/components/chat/ChatModal";

const MY_ORDERS_URL = "https://functions.poehali.dev/458454d0-900d-46a1-9bff-15ecce0839e0";

interface Inquiry {
  id: number;
  master_id: number;
  service_id: number | null;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  message: string;
  is_read: boolean;
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
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export default function CustomerInquiries({ customerName, customerEmail, customerPhone }: CustomerInquiriesProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInquiry, setChatInquiry] = useState<Inquiry | null>(null);

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

  useEffect(() => {
    loadInquiries(true);
    const interval = setInterval(() => loadInquiries(false), 15000);
    return () => clearInterval(interval);
  }, [customerEmail, customerPhone]);

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
          <p className="text-gray-500 text-sm mt-0.5">Объявления мастеров, на которые вы откликнулись</p>
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
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-white/4 border border-white/8 rounded-2xl p-4 hover:border-white/12 transition-all">
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
                    <span className="text-gray-600 text-xs flex-shrink-0">{formatDate(inq.created_at)}</span>
                  </div>

                  {inq.service_title && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon name="Briefcase" size={11} className="text-violet-400" />
                      <span className="text-violet-300 text-xs">{inq.service_title}</span>
                    </div>
                  )}

                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">«{inq.message}»</p>

                  <Button
                    size="sm"
                    onClick={() => setChatInquiry(inq)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs h-8 px-4 gap-1.5"
                  >
                    <Icon name="MessageSquare" size={13} />
                    Чат с мастером
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {chatInquiry && (
        <ChatModal
          inquiryId={chatInquiry.id}
          myRole="customer"
          myName={customerName}
          partnerName={chatInquiry.master_name}
          partnerCategory={chatInquiry.master_category}
          serviceTitle={chatInquiry.service_title || undefined}
          onClose={() => setChatInquiry(null)}
        />
      )}
    </div>
  );
}