import { useState } from "react";
import type { Tab } from "./AdminSidebar";
import { DashboardTab, MastersTab, CustomersTab } from "./AdminTabUsers";
import { OrdersTab, ResponsesTab, ServicesTab } from "./AdminTabOrders";
import { ChatsTab, PaymentsTab } from "./AdminTabChatsPayments";
import { ReviewsTab, CategoriesTab, TicketsTab } from "./AdminTabMisc";
import { useDateFilter } from "./adminUtils";

interface AdminTabContentProps {
  tab: Tab;
  loading: boolean;
  dashboard: Record<string, number> | null;
  masters: Record<string, unknown>[];
  customers: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  services: Record<string, unknown>[];
  chats: Record<string, unknown>[];
  chatMessages: Record<string, unknown>[];
  activeChatId: number | null;
  responses: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  newCategory: string;
  setNewCategory: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onOpenEdit: (type: "master" | "customer", data: Record<string, unknown>) => void;
  onOpenBalance: (m: Record<string, unknown>) => void;
  onBlockMaster: (id: number, block: boolean) => void;
  onBlockCustomer: (id: number, block: boolean) => void;
  onDeleteMaster: (id: number) => void;
  onDeleteCustomer: (id: number) => void;
  onUpdateOrderStatus: (id: number, status: string) => void;
  onDeleteOrder: (id: number) => void;
  onDeleteReview: (id: number) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: number) => void;
  onEditService: (s: Record<string, unknown>) => void;
  onDeleteService: (id: number) => void;
  onToggleService: (id: number, active: boolean) => void;
  onDeleteChat: (id: number) => void;
  onViewChat: (id: number) => void;
  onDeleteResponse: (id: number) => void;
  tickets: Record<string, unknown>[];
  onReplyTicket: (id: number, reply: string) => void;
  onDeleteTicket: (id: number) => void;
}

export default function AdminTabContent({
  tab, loading, dashboard, masters, customers, orders, reviews, categories,
  services, chats, chatMessages, activeChatId, responses, payments,
  newCategory, setNewCategory, searchQuery, setSearchQuery,
  onOpenEdit, onOpenBalance, onBlockMaster, onBlockCustomer, onDeleteMaster, onDeleteCustomer,
  onUpdateOrderStatus, onDeleteOrder, onDeleteReview, onAddCategory, onDeleteCategory,
  onEditService, onDeleteService, onToggleService, onDeleteChat, onViewChat, onDeleteResponse,
  tickets, onReplyTicket, onDeleteTicket,
}: AdminTabContentProps) {

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const mastersDf   = useDateFilter(masters,   "created_at", dateFrom, dateTo);
  const customersDf = useDateFilter(customers, "created_at", dateFrom, dateTo);
  const ordersDf    = useDateFilter(orders,    "created_at", dateFrom, dateTo);
  const reviewsDf   = useDateFilter(reviews,   "created_at", dateFrom, dateTo);
  const servicesDf  = useDateFilter(services,  "created_at", dateFrom, dateTo);
  const chatsDf     = useDateFilter(chats,     "created_at", dateFrom, dateTo);
  const responsesDf = useDateFilter(responses, "created_at", dateFrom, dateTo);
  const paymentsDf  = useDateFilter(payments,  "created_at", dateFrom, dateTo);

  if (tab === "dashboard") {
    return <DashboardTab loading={loading} dashboard={dashboard} />;
  }

  if (tab === "masters") {
    return (
      <MastersTab
        loading={loading} masters={masters} mastersDf={mastersDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onOpenEdit={onOpenEdit} onOpenBalance={onOpenBalance}
        onBlockMaster={onBlockMaster} onDeleteMaster={onDeleteMaster}
      />
    );
  }

  if (tab === "customers") {
    return (
      <CustomersTab
        loading={loading} customers={customers} customersDf={customersDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onOpenEdit={onOpenEdit} onBlockCustomer={onBlockCustomer} onDeleteCustomer={onDeleteCustomer}
      />
    );
  }

  if (tab === "orders") {
    return (
      <OrdersTab
        loading={loading} orders={orders} ordersDf={ordersDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onUpdateOrderStatus={onUpdateOrderStatus} onDeleteOrder={onDeleteOrder}
      />
    );
  }

  if (tab === "responses") {
    return (
      <ResponsesTab
        loading={loading} responses={responses} responsesDf={responsesDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onDeleteResponse={onDeleteResponse}
      />
    );
  }

  if (tab === "services") {
    return (
      <ServicesTab
        loading={loading} services={services} servicesDf={servicesDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onEditService={onEditService} onDeleteService={onDeleteService} onToggleService={onToggleService}
      />
    );
  }

  if (tab === "chats") {
    return (
      <ChatsTab
        loading={loading} chats={chats} chatsDf={chatsDf}
        chatMessages={chatMessages} activeChatId={activeChatId}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onDeleteChat={onDeleteChat} onViewChat={onViewChat}
      />
    );
  }

  if (tab === "payments") {
    return (
      <PaymentsTab
        loading={loading} payments={payments} paymentsDf={paymentsDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
      />
    );
  }

  if (tab === "reviews") {
    return (
      <ReviewsTab
        loading={loading} reviews={reviews} reviewsDf={reviewsDf}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onDeleteReview={onDeleteReview}
      />
    );
  }

  if (tab === "categories") {
    return (
      <CategoriesTab
        loading={loading} categories={categories}
        newCategory={newCategory} setNewCategory={setNewCategory}
        onAddCategory={onAddCategory} onDeleteCategory={onDeleteCategory}
      />
    );
  }

  if (tab === "tickets") {
    return (
      <TicketsTab
        loading={loading} tickets={tickets}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        onReplyTicket={onReplyTicket} onDeleteTicket={onDeleteTicket}
      />
    );
  }

  return null;
}
