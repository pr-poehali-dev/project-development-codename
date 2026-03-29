import Icon from "@/components/ui/icon";

export type Tab =
  | "dashboard"
  | "masters"
  | "customers"
  | "orders"
  | "responses"
  | "services"
  | "chats"
  | "payments"
  | "reviews"
  | "categories";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Обзор", icon: "LayoutDashboard" },
  { id: "masters", label: "Мастера", icon: "Wrench" },
  { id: "customers", label: "Заказчики", icon: "Users" },
  { id: "orders", label: "Заявки", icon: "FileText" },
  { id: "responses", label: "Отклики", icon: "MessageCircle" },
  { id: "services", label: "Объявления", icon: "Briefcase" },
  { id: "chats", label: "Переписки", icon: "MessagesSquare" },
  { id: "payments", label: "Платежи", icon: "CreditCard" },
  { id: "reviews", label: "Отзывы", icon: "Star" },
  { id: "categories", label: "Категории", icon: "Tag" },
];

interface AdminSidebarProps {
  tab: Tab;
  setTab: (t: Tab) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ tab, setTab, onLogout }: AdminSidebarProps) {
  return (
    <aside className="w-56 bg-white border-r flex flex-col py-6 px-3 gap-1 min-h-screen flex-shrink-0">
      <div className="flex items-center gap-2 px-3 mb-6">
        <Icon name="Shield" size={22} className="text-purple-600" />
        <span className="font-bold text-gray-800">Админ</span>
      </div>
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors mb-2"
      >
        <Icon name="ArrowLeft" size={16} />
        Назад
      </button>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === t.id ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Icon name={t.icon} size={16} />
          {t.label}
        </button>
      ))}
      <div className="mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <Icon name="LogOut" size={16} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
