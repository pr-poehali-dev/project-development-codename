import Icon from "@/components/ui/icon";

type Tab = "orders" | "inquiries" | "profile";

interface CabinetTabsProps {
  cabinetTab: Tab;
  setCabinetTab: (t: Tab) => void;
  ordersCount: number;
  inquiryCount: number;
  unreadMessages: number;
}

export default function CabinetTabs({ cabinetTab, setCabinetTab, ordersCount, inquiryCount, unreadMessages }: CabinetTabsProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCabinetTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cabinetTab === "orders" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
        >
          <Icon name="ClipboardList" size={15} />
          Мои заявки
          {ordersCount > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-md ${cabinetTab === "orders" ? "bg-white/20" : "bg-white/10"}`}>{ordersCount}</span>}
        </button>
        <button
          onClick={() => setCabinetTab("inquiries")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cabinetTab === "inquiries" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
        >
          <Icon name="MessageSquare" size={15} />
          Мои обращения
          {unreadMessages > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-medium">{unreadMessages}</span>
          )}
          {unreadMessages === 0 && inquiryCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${cabinetTab === "inquiries" ? "bg-white/20" : "bg-white/10"}`}>{inquiryCount}</span>
          )}
        </button>
        <button
          onClick={() => setCabinetTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cabinetTab === "profile" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
        >
          <Icon name="User" size={15} />
          Профиль
        </button>
      </div>
    </div>
  );
}
