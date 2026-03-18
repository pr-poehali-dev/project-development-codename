import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { categoryColors } from "@/pages/categoryColors";

interface Order {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: number | null;
  contact_name: string;
  status: string;
  created_at: string;
}

interface OrderCardProps {
  order: Order;
  onClick: (order: Order) => void;
  formatDate: (iso: string) => string;
}

export default function OrderCard({ order, onClick, formatDate }: OrderCardProps) {
  return (
    <div
      className="group bg-white/4 border border-white/8 rounded-xl p-3.5 hover:border-violet-500/40 hover:bg-white/6 transition-all cursor-pointer flex flex-col"
      onClick={() => onClick(order)}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge className={`text-[10px] px-2 py-0.5 rounded-md border leading-tight ${categoryColors[order.category] || "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
          {order.category}
        </Badge>
        <span className="text-gray-600 text-[10px] flex-shrink-0">{formatDate(order.created_at)}</span>
      </div>

      <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug group-hover:text-violet-200 transition-colors line-clamp-2">
        {order.title}
      </h3>

      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1 mb-2.5">
        {order.description}
      </p>

      <div className="flex items-center justify-between pt-2.5 border-t border-white/6">
        <div>
          {order.budget ? (
            <span className="text-white font-bold text-sm">до {order.budget.toLocaleString("ru-RU")} ₽</span>
          ) : (
            <span className="text-gray-500 text-xs">Бюджет не указан</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-[10px]">
          {order.city && <><Icon name="MapPin" size={9} />{order.city}</>}
        </div>
      </div>
    </div>
  );
}