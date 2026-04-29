import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Service, ContactMasterTarget, ContactForm } from "./types";
import { highlightMatch } from "./highlightMatch";

interface ServicesGridProps {
  filteredServices: Service[];
  servicesVisible: number;
  setServicesVisible: (fn: (v: number) => number) => void;
  isMaster: boolean;
  isCustomer: boolean;
  setContactMaster: (v: ContactMasterTarget | null) => void;
  setContactForm: (v: ContactForm) => void;
  setContactSent: (v: boolean) => void;
  setContactError: (v: string) => void;
  search?: string;
}

export default function ServicesGrid({
  filteredServices,
  servicesVisible,
  setServicesVisible,
  isMaster,
  isCustomer,
  setContactMaster,
  setContactForm,
  setContactSent,
  setContactError,
  search = "",
}: ServicesGridProps) {
  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Icon name="Briefcase" size={28} className="text-gray-600" />
        </div>
        <p className="text-gray-400 text-lg mb-2">Объявлений не найдено</p>
        <p className="text-gray-600 text-sm">Попробуйте изменить фильтры</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredServices.slice(0, servicesVisible).map((service) => {
          const isBoosted = !!service.boosted_until && new Date(service.boosted_until) > new Date();
          return (
            <div
              key={service.id}
              className={`group rounded-xl p-3.5 transition-all flex flex-col relative ${
                isBoosted
                  ? "bg-gradient-to-b from-amber-500/8 to-white/4 border border-amber-500/30 hover:border-amber-400/50"
                  : "bg-white/4 border border-white/8 hover:border-violet-500/40 hover:bg-white/6"
              }`}
            >
              {isBoosted && (
                <div className="absolute -top-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full" />
              )}
              <a href={`/master-page?id=${service.master_id}`} className="block flex-1">
                <div className="flex items-start justify-between mb-2.5">
                  <Badge
                    className="text-[10px] px-2 py-0.5 rounded-md leading-tight"
                    style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    {highlightMatch(service.category, search)}
                  </Badge>
                  {isBoosted ? (
                    <span className="flex items-center gap-0.5 text-amber-400 text-[10px] font-medium">
                      <Icon name="Zap" size={10} />Топ
                    </span>
                  ) : service.rating ? (
                    <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                      <Icon name="Star" size={11} />
                      <span>{service.rating}</span>
                      <span className="text-gray-600 text-[10px]">({service.reviews_count})</span>
                    </div>
                  ) : (
                    <span className="text-gray-600 text-[10px]">Новый</span>
                  )}
                </div>
                <h3 className="text-white font-semibold text-sm mb-2.5 leading-snug group-hover:text-violet-200 transition-colors line-clamp-2">
                  {highlightMatch(service.title, search)}
                </h3>
                <div className="flex items-center gap-2 mb-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: service.avatar_color }}
                  >
                    {service.master_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-300 font-medium truncate">{highlightMatch(service.master_name, search)}</div>
                    {service.city && (
                      <div className="text-[10px] text-gray-600 flex items-center gap-0.5">
                        <Icon name="MapPin" size={8} />{service.city}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    {service.price ? (
                      <>
                        <span className="text-gray-500 text-[10px]">от</span>
                        <span className="text-white font-bold text-sm ml-1">{service.price.toLocaleString("ru-RU")} ₽</span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs">По договору</span>
                    )}
                  </div>
                  <span className="text-violet-400 text-[10px] hover:text-violet-300 transition-colors">Профиль →</span>
                </div>
              </a>
              {!isMaster && (
                <Button
                  size="sm"
                  className="w-full mt-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs rounded-lg h-7"
                  onClick={() => {
                    if (!isCustomer) { window.location.href = "/cabinet"; return; }
                    setContactMaster({ id: service.master_id, name: service.master_name, serviceId: service.id });
                    setContactForm({ name: "", phone: "", email: "", message: "" });
                    setContactSent(false);
                    setContactError("");
                  }}
                >
                  <Icon name="MessageSquare" size={11} className="mr-1" />
                  Написать мастеру
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {servicesVisible < filteredServices.length && (
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            className="border border-white/10 text-gray-400 hover:text-white hover:border-white/20 px-8"
            onClick={() => setServicesVisible(v => v + 20)}
          >
            Показать ещё ({filteredServices.length - servicesVisible} осталось)
          </Button>
        </div>
      )}
    </>
  );
}