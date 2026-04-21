import { useEffect } from "react";
import { getInitialPaymentId } from "./masterCabinetTypes";

interface UseMasterCabinetInitParams {
  setPhone: (p: string) => void;
  setInputPhone: (p: string) => void;
  loadProfile: (p: string) => Promise<void>;
  loadPackages: () => void;
  checkPayment: (paymentId: string, phone: string) => void;
}

export function useMasterCabinetInit({
  setPhone,
  setInputPhone,
  loadProfile,
  loadPackages,
  checkPayment,
}: UseMasterCabinetInitParams) {
  useEffect(() => {
    const saved = localStorage.getItem("master_phone");
    const initialPaymentId = getInitialPaymentId();
    if (saved) {
      setPhone(saved);
      setInputPhone(saved);
      loadProfile(saved).then(() => {
        if (initialPaymentId) checkPayment(initialPaymentId, saved);
      });
    }
    loadPackages();
  }, []);
}
