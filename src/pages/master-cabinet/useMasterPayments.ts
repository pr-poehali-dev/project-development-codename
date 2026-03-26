import { useState } from "react";
import type { Master } from "./useMasterProfile";

const PAYMENTS_URL = "https://functions.poehali.dev/cad10a69-4b34-4497-960c-f6026044d2f8";
const PACKAGES_URL = "https://functions.poehali.dev/a097fcb4-fb63-44d8-9784-e4fa20009cb4";

export interface Package {
  id: number;
  name: string;
  responses_count: number;
  price: number;
}

interface UseMasterPaymentsProps {
  master: Master | null;
  phone: string;
  loadProfile: (p: string) => Promise<void>;
}

export function useMasterPayments({ master, phone, loadProfile }: UseMasterPaymentsProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buySuccess, setBuySuccess] = useState("");
  const [paymentChecking, setPaymentChecking] = useState(false);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
  const [checkoutPaymentId, setCheckoutPaymentId] = useState<number | null>(null);

  const loadPackages = async () => {
    const res = await fetch(PACKAGES_URL);
    const data = await res.json();
    setPackages(data.packages || []);
  };

  const checkPayment = async (paymentId: string, masterPhone: string) => {
    setPaymentChecking(true);
    try {
      const res = await fetch(`${PAYMENTS_URL}?action=check&payment_id=${paymentId}`);
      const data = await res.json();
      if (data.status === "succeeded") {
        setBuySuccess(`Оплата прошла! Зачислено ${data.tokens} токенов.`);
        await loadProfile(masterPhone);
        setTimeout(() => setBuySuccess(""), 6000);
      } else if (data.status === "canceled") {
        setBuySuccess("Оплата отменена.");
        setTimeout(() => setBuySuccess(""), 4000);
      }
    } finally {
      setPaymentChecking(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("payment_id");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleBuy = async (pkg: Package) => {
    if (!master) return;
    setBuyingId(pkg.id);
    setBuySuccess("");
    try {
      const res = await fetch(PAYMENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", master_id: master.id, package_id: pkg.id }),
      });
      const data = await res.json();
      if (data.confirmation_token) {
        setCheckoutToken(data.confirmation_token);
        setCheckoutPaymentId(data.payment_id);
      } else {
        setBuySuccess("Ошибка при создании платежа. Попробуй ещё раз.");
        setTimeout(() => setBuySuccess(""), 4000);
      }
    } finally {
      setBuyingId(null);
    }
  };

  const handleCheckoutSuccess = async () => {
    setCheckoutToken(null);
    if (checkoutPaymentId) {
      setPaymentChecking(true);
      try {
        const res = await fetch(`${PAYMENTS_URL}?action=check&payment_id=${checkoutPaymentId}`);
        const data = await res.json();
        if (data.status === "succeeded") {
          setBuySuccess(`Оплата прошла! Зачислено ${data.tokens} токенов.`);
          await loadProfile(phone);
          setTimeout(() => setBuySuccess(""), 6000);
        }
      } finally {
        setPaymentChecking(false);
        setCheckoutPaymentId(null);
      }
    }
  };

  return {
    packages,
    buyingId,
    buySuccess,
    paymentChecking,
    checkoutToken,
    setCheckoutToken,
    loadPackages,
    checkPayment,
    handleBuy,
    handleCheckoutSuccess,
  };
}
