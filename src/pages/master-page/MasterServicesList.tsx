import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Service } from "./masterPageTypes";

interface MasterServicesListProps {
  services: Service[];
}

export default function MasterServicesList({ services }: MasterServicesListProps) {
  if (services.length === 0) return null;

  return (
    <>
      <h2 className="text-lg font-semibold text-white mb-4">Услуги</h2>
      <div className="grid gap-3 sm:grid-cols-2 mb-8">
        {services.map((s) => (
          <div key={s.id} className="bg-white/4 border border-white/8 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-white font-medium text-sm leading-snug">{s.title}</p>
              {s.price && (
                <span className="text-emerald-400 text-sm font-semibold whitespace-nowrap">от {s.price.toLocaleString("ru-RU")} ₽</span>
              )}
            </div>
            {s.description && <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{s.description}</p>}
            {s.subcategories?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {s.subcategories.map(sub => (
                  <span key={sub} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600/10 text-violet-400 border border-violet-500/20">{sub}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-auto pt-1">
              <Badge className="bg-violet-600/15 text-violet-400 border-violet-500/20 text-xs">{s.category}</Badge>
              {s.city && <span className="text-gray-600 text-xs flex items-center gap-1"><Icon name="MapPin" size={10} />{s.city}</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
