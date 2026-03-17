import { useState } from "react";
import Icon from "@/components/ui/icon";
import { categories as CATEGORIES } from "@/components/home/categories";
import ServiceDeleteModal from "./ServiceDeleteModal";
import ServiceEditModal from "./ServiceEditModal";
import ServiceAddForm from "./ServiceAddForm";
import ServiceCard from "./ServiceCard";
import ServicePricingBanner from "./ServicePricingBanner";

const getParentCategory = (value: string) =>
  CATEGORIES.find(c => c.subcategories.includes(value))?.name ?? (CATEGORIES.some(c => c.name === value) ? value : "");

interface Master {
  id: number;
  name: string;
  phone: string;
  category: string;
  city: string;
  balance: number;
  created_at: string;
}

interface MyService {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  price: number | null;
  is_active: boolean;
  paid_until: string | null;
  boosted_until: string | null;
  boost_count: number;
  created_at: string;
}

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  city: string;
  price: string;
}

interface MasterTabServicesProps {
  master: Master;
  myServices: MyService[];
  showServiceForm: boolean;
  setShowServiceForm: (v: boolean) => void;
  serviceForm: ServiceForm;
  setServiceForm: (fn: (f: ServiceForm) => ServiceForm) => void;
  serviceLoading: boolean;
  onAddService: (e: React.FormEvent) => void;
  onToggleService: (serviceId: number, isActive: boolean) => void;
  onBoostService: (serviceId: number) => void;
  onUpdateService: (serviceId: number, data: ServiceForm) => Promise<void>;
  onDeleteService: (serviceId: number) => Promise<void>;
}

export default function MasterTabServices({
  master,
  myServices,
  showServiceForm,
  setShowServiceForm,
  serviceForm,
  setServiceForm,
  serviceLoading,
  onAddService,
  onToggleService,
  onBoostService,
  onUpdateService,
  onDeleteService,
}: MasterTabServicesProps) {
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);
  const [deleteServiceLoading, setDeleteServiceLoading] = useState(false);

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;
    setDeleteServiceLoading(true);
    await onDeleteService(deleteServiceId);
    setDeleteServiceLoading(false);
    setDeleteServiceId(null);
  };

  const [editService, setEditService] = useState<MyService | null>(null);
  const [editForm, setEditForm] = useState<ServiceForm>({ title: "", description: "", category: "", city: "", price: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editMainCat, setEditMainCat] = useState("");
  const [addMainCat, setAddMainCat] = useState("");

  const openEditService = (s: MyService) => {
    setEditService(s);
    setEditForm({ title: s.title, description: s.description, category: s.category, city: s.city, price: s.price ? String(s.price) : "" });
    setEditMainCat(getParentCategory(s.category) || s.category);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;
    setEditLoading(true);
    await onUpdateService(editService.id, editForm);
    setEditLoading(false);
    setEditService(null);
  };

  return (
    <div>
      <ServiceDeleteModal
        deleteServiceId={deleteServiceId}
        deleteServiceLoading={deleteServiceLoading}
        onConfirm={handleDeleteService}
        onCancel={() => setDeleteServiceId(null)}
      />

      <ServiceEditModal
        editService={editService}
        editForm={editForm}
        setEditForm={setEditForm}
        editMainCat={editMainCat}
        setEditMainCat={setEditMainCat}
        editLoading={editLoading}
        onSubmit={handleEditSubmit}
        onClose={() => setEditService(null)}
      />

      {!showServiceForm && (
        <ServicePricingBanner onAddService={() => setShowServiceForm(true)} />
      )}

      {showServiceForm && (
        <ServiceAddForm
          master={master}
          serviceForm={serviceForm}
          setServiceForm={setServiceForm}
          serviceLoading={serviceLoading}
          servicesCount={myServices.length}
          addMainCat={addMainCat}
          setAddMainCat={setAddMainCat}
          onSubmit={onAddService}
          onCancel={() => setShowServiceForm(false)}
        />
      )}

      {myServices.length === 0 && !showServiceForm ? (
        <div className="text-center py-8 text-gray-500">
          <Icon name="Briefcase" size={32} className="mx-auto mb-3 opacity-40" />
          <p>Услуг пока нет — добавьте первую</p>
        </div>
      ) : myServices.length > 0 && (
        <div className="flex flex-col gap-3">
          {myServices.map(s => (
            <ServiceCard
              key={s.id}
              service={s}
              onEdit={openEditService}
              onDelete={setDeleteServiceId}
              onBoost={onBoostService}
              onToggle={onToggleService}
            />
          ))}
        </div>
      )}
    </div>
  );
}
