import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import OrderCard from "@/components/cabinet/OrderCard";
import { DeleteOrderModal, EditOrderModal, ReviewModal } from "@/components/cabinet/OrderModals";

interface Review {
  id: number;
  rating: number;
  comment: string;
}

interface Response {
  id: number;
  master_name: string;
  master_phone: string;
  master_category: string;
  master_id: number | null;
  master_balance: number;
  message: string;
  created_at: string;
  review: Review | null;
}

interface Order {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: number | null;
  status: string;
  accepted_response_id: number | null;
  created_at: string;
  responses: Response[];
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface CabinetOrderListProps {
  orders: Order[];
  customer: Customer;
  reviewSuccess: string;
  statusLoading: number | null;
  selectMasterLoading: number | null;
  onStatusChange: (orderId: number, status: string) => void;
  onSelectMaster: (orderId: number, responseId: number) => void;
  onReviewSubmit: (e: React.FormEvent, form: { orderId: number; masterName: string; masterId: number | null }, rating: number, comment: string) => void;
  onUpdateOrder: (orderId: number, data: { title: string; description: string; category: string; city: string; budget: string }) => Promise<void>;
  onDeleteOrder: (orderId: number) => Promise<void>;
  onCreateOrder: () => void;
}

export default function CabinetOrderList({
  orders, customer, reviewSuccess,
  statusLoading, selectMasterLoading,
  onStatusChange, onSelectMaster, onReviewSubmit, onUpdateOrder, onDeleteOrder, onCreateOrder,
}: CabinetOrderListProps) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "done">("active");

  // Состояние модалки отзыва
  const [reviewForm, setReviewForm] = useState<{ orderId: number; masterName: string; masterId: number | null } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Состояние модалки удаления
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Состояние модалки редактирования
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "", city: "", budget: "" });
  const [editLoading, setEditLoading] = useState(false);

  const activeOrders = orders.filter(o => o.status !== "done" && o.status !== "cancelled");
  const doneOrders = orders.filter(o => o.status === "done" || o.status === "cancelled");
  const visibleOrders = activeTab === "active" ? activeOrders : doneOrders;
  const totalResponses = orders.reduce((s, o) => s + o.responses.length, 0);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    if (!reviewForm) return;
    setReviewLoading(true);
    await onReviewSubmit(e, reviewForm, reviewRating, reviewComment);
    setReviewLoading(false);
    setReviewForm(null);
    setReviewComment("");
    setReviewRating(5);
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;
    setDeleteLoading(true);
    await onDeleteOrder(deleteOrderId);
    setDeleteLoading(false);
    setDeleteOrderId(null);
  };

  const openEditOrder = (order: Order) => {
    setEditOrder(order);
    setEditForm({
      title: order.title,
      description: order.description,
      category: order.category,
      city: order.city,
      budget: order.budget ? String(order.budget) : "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;
    setEditLoading(true);
    await onUpdateOrder(editOrder.id, editForm);
    setEditLoading(false);
    setEditOrder(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {reviewSuccess && (
        <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-emerald-400 text-sm">
          <Icon name="CheckCircle" size={16} />
          {reviewSuccess}
        </div>
      )}

      {/* Сводка */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Заявок", value: orders.length, icon: "ClipboardList", color: "text-violet-400" },
          { label: "Откликов", value: totalResponses, icon: "MessageCircle", color: "text-emerald-400" },
          { label: "Активных", value: orders.filter(o => o.status === "new").length, icon: "Clock", color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/4 border border-white/8 rounded-2xl p-4 text-center">
            <Icon name={stat.icon} size={20} className={`${stat.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Модалки */}
      <DeleteOrderModal
        deleteOrderId={deleteOrderId}
        deleteLoading={deleteLoading}
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteOrderId(null)}
      />
      <EditOrderModal
        editOrder={editOrder}
        editForm={editForm}
        editLoading={editLoading}
        setEditForm={setEditForm}
        onSubmit={handleEditSubmit}
        onCancel={() => setEditOrder(null)}
      />
      <ReviewModal
        reviewForm={reviewForm}
        reviewRating={reviewRating}
        reviewComment={reviewComment}
        reviewLoading={reviewLoading}
        setReviewRating={setReviewRating}
        setReviewComment={setReviewComment}
        onSubmit={handleReviewSubmit}
        onCancel={() => setReviewForm(null)}
      />

      {/* Вкладки */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "active" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
        >
          <Icon name="Clock" size={15} />
          Активные
          {activeOrders.length > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === "active" ? "bg-white/20" : "bg-white/10"}`}>{activeOrders.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("done")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "done" ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/8"}`}
        >
          <Icon name="CheckCircle" size={15} />
          Завершённые
          {doneOrders.length > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === "done" ? "bg-white/20" : "bg-white/10"}`}>{doneOrders.length}</span>}
        </button>
      </div>

      {/* Список заявок */}
      {visibleOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Icon name="ClipboardList" size={28} className="text-gray-600" />
          </div>
          {activeTab === "active" ? (
            <>
              <p className="text-gray-500 text-lg">Активных заявок нет</p>
              <Button onClick={onCreateOrder} className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">Создать заявку</Button>
            </>
          ) : (
            <p className="text-gray-500 text-lg">Завершённых заявок пока нет</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedOrder === order.id}
              onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              statusLoading={statusLoading}
              selectMasterLoading={selectMasterLoading}
              onStatusChange={onStatusChange}
              onSelectMaster={onSelectMaster}
              onOpenEdit={openEditOrder}
              onOpenDelete={setDeleteOrderId}
              onOpenReview={(orderId, masterName, masterId) => {
                setReviewForm({ orderId, masterName, masterId });
                setReviewRating(5);
                setReviewComment("");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}