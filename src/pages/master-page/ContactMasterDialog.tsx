import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Master, inputCls } from "./masterPageTypes";

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface ContactMasterDialogProps {
  master: Master;
  contactOpen: boolean;
  setContactOpen: (v: boolean) => void;
  contactForm: ContactForm;
  setContactForm: (fn: (f: ContactForm) => ContactForm) => void;
  contactLoading: boolean;
  contactSent: boolean;
  contactError: string;
  handleContactSubmit: (e: React.FormEvent) => void;
}

export default function ContactMasterDialog({
  master,
  contactOpen,
  setContactOpen,
  contactForm,
  setContactForm,
  contactLoading,
  contactSent,
  contactError,
  handleContactSubmit,
}: ContactMasterDialogProps) {
  if (!contactOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setContactOpen(false)}>
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">Написать {master.name?.split(" ")[0]}</h3>
            <p className="text-gray-500 text-xs mt-0.5">Контакты откроются только после взаимного подтверждения</p>
          </div>
          <button onClick={() => setContactOpen(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        {contactSent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={28} className="text-emerald-400" />
            </div>
            <p className="text-white font-semibold mb-1">Сообщение отправлено!</p>
            <p className="text-gray-400 text-sm">Мастер получил уведомление и свяжется с вами</p>
            <Button onClick={() => setContactOpen(false)} className="mt-5 bg-violet-600 hover:bg-violet-500 text-white w-full">Закрыть</Button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
              <Icon name="Lock" size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-amber-300 text-xs leading-relaxed">Ваши контакты скрыты. Они появятся у мастера только когда вы оба нажмёте «Договорились» в чате.</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Ваше имя *</label>
              <input required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} placeholder="Иван Иванов" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Телефон</label>
              <input type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (999) 000-00-00" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Сообщение *</label>
              <textarea required rows={3} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} placeholder="Что нужно сделать?" className={`${inputCls} resize-none`} />
            </div>
            {contactError && <p className="text-amber-400 text-sm">{contactError}</p>}
            <Button type="submit" disabled={contactLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full mt-1">
              {contactLoading ? "Отправка..." : "Отправить"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
