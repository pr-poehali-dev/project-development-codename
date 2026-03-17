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
      className="group bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-violet-500/40 hover:bg-white/6 transition-all cursor-pointer flex flex-col"
      onClick={() => onClick(order)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs px-2.5 py-1 rounded-lg border ${categoryColors[order.category] || "bg-violet-600/15 text-violet-400 border-violet-500/20"}`}>
            {order.category}
          </Badge>
          {order.city && (
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <Icon name="MapPin" size={11} />
              {order.city}
            </span>
          )}
        </div>
        <span className="text-gray-600 text-xs flex-shrink-0">{formatDate(order.created_at)}</span>
      </div>

      <h3 className="text-white font-semibold text-base mb-2 leading-snug group-hover:text-violet-200 transition-colors">
        {order.title}
      </h3>

      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
        {order.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/6">
        <div>
          {order.budget ? (
            <span className="text-white font-bold">до {order.budget.toLocaleString("ru-RU")} ₽</span>
          ) : (
            <span className="text-gray-500 text-sm">Бюджет не указан</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <Icon name="User" size={13} />
          {order.contact_name}
        </div>
      </div>
    </div>
  );
}
