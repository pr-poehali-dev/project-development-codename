import React from "react";
import LoginRegisterModals from "@/components/home/LoginRegisterModals";
import MasterRegisterModal from "@/components/home/MasterRegisterModal";
import OrderModal from "@/components/home/OrderModal";

interface MasterForm {
  name: string;
  phone: string;
  email: string;
  category: string;
  city: string;
  about: string;
  status: string;
}

interface OrderForm {
  title: string;
  description: string;
  category: string;
  city: string;
  budget: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

interface HomeModalsProps {
  // Login modal
  loginModalOpen: boolean;
  setLoginModalOpen: (v: boolean) => void;

  // Register modal
  registerModalOpen: boolean;
  setRegisterModalOpen: (v: boolean) => void;

  // Master modal
  masterModalOpen: boolean;
  setMasterModalOpen: (v: boolean) => void;
  masterForm: MasterForm;
  setMasterForm: (form: MasterForm) => void;
  masterSent: boolean;
  setMasterSent: (v: boolean) => void;
  masterLoading: boolean;
  masterError: string;
  handleMasterSubmit: (e: React.FormEvent) => void;

  // Order modal
  orderModalOpen: boolean;
  setOrderModalOpen: (v: boolean) => void;
  orderForm: OrderForm;
  setOrderForm: (form: OrderForm) => void;
  orderSent: boolean;
  setOrderSent: (v: boolean) => void;
  orderLoading: boolean;
  orderError: string;
  setOrderError: (v: string) => void;
  handleOrderSubmit: (e: React.FormEvent) => void;
}

const HomeModals = ({
  loginModalOpen,
  setLoginModalOpen,
  registerModalOpen,
  setRegisterModalOpen,
  masterModalOpen,
  setMasterModalOpen,
  masterForm,
  setMasterForm,
  masterSent,
  setMasterSent,
  masterLoading,
  masterError,
  handleMasterSubmit,
  orderModalOpen,
  setOrderModalOpen,
  orderForm,
  setOrderForm,
  orderSent,
  setOrderSent,
  orderLoading,
  orderError,
  setOrderError,
  handleOrderSubmit,
}: HomeModalsProps) => {
  return (
    <>
      <MasterRegisterModal
        masterModalOpen={masterModalOpen}
        setMasterModalOpen={setMasterModalOpen}
        masterForm={masterForm}
        setMasterForm={setMasterForm}
        masterSent={masterSent}
        setMasterSent={setMasterSent}
        masterLoading={masterLoading}
        masterError={masterError}
        handleMasterSubmit={handleMasterSubmit}
      />
      <OrderModal
        orderModalOpen={orderModalOpen}
        setOrderModalOpen={setOrderModalOpen}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        orderSent={orderSent}
        setOrderSent={setOrderSent}
        orderLoading={orderLoading}
        orderError={orderError}
        setOrderError={setOrderError}
        handleOrderSubmit={handleOrderSubmit}
      />
      <LoginRegisterModals
        loginModalOpen={loginModalOpen}
        setLoginModalOpen={setLoginModalOpen}
        registerModalOpen={registerModalOpen}
        setRegisterModalOpen={setRegisterModalOpen}
        setOrderModalOpen={setOrderModalOpen}
      />
    </>
  );
};

export default HomeModals;
