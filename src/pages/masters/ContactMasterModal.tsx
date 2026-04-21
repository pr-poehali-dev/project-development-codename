import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ContactForm, ContactMasterTarget } from "./types";

interface ContactMasterModalProps {
  contactMaster: ContactMasterTarget | null;
  setContactMaster: (v: ContactMasterTarget | null) => void;
  contactForm: ContactForm;
  setContactForm: (fn: (f: ContactForm) => ContactForm) => void;
  contactLoading: boolean;
  contactSent: boolean;
  contactError: string;
  handleContactSubmit: (e: React.FormEvent) => void;
}

export default function ContactMasterModal({
  contactMaster,
  setContactMaster,
  contactForm,
  setContactForm,
  contactLoading,
  contactSent,
  contactError,
  handleContactSubmit,
}: ContactMasterModalProps) {
  if (!contactMaster) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setContactMaster(null)}>
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Написать мастеру {contactMaster.name}</h3>
          <button onClick={() => setContactMaster(null)} className="text-gray-500 hover:text-white transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        {contactSent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={28} className="text-emerald-400" />
            </div>
            <p className="text-white font-semibold mb-1">Обращение отправлено!</p>
            <p className="text-gray-400 text-sm">Мастер получит ваше сообщение и сможет ответить</p>
            <Button onClick={() => setContactMaster(null)} className="mt-5 bg-violet-600 hover:bg-violet-500 text-white w-full text-sm">
              Закрыть
            </Button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Ваше имя *</label>
              <input required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Иван" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Телефон *</label>
              <input required value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="+7 (999) 000-00-00" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Сообщение *</label>
              <textarea required rows={3} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                placeholder="Опишите, что вам нужно..." />
            </div>
            {contactError && <p className="text-red-400 text-xs">{contactError}</p>}
            <Button type="submit" disabled={contactLoading} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm">
              {contactLoading ? "Отправка..." : "Отправить"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
