import { useEffect } from "react";

const PUSH_URL = "https://functions.poehali.dev/272080b1-1a80-40bd-8201-0951cb380c57";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";
// При смене ключа меняй эту версию — сбросит старые подписки
const VAPID_VERSION = "v3";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function subscribeAll(phones: { phone: string; role: "customer" | "master" }[]) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (!VAPID_PUBLIC_KEY) return;

  try {
    const reg = await navigator.serviceWorker.ready;

    // Если есть старая подписка — отписываемся, чтобы подписаться с новым ключом
    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await Promise.all(phones.map(({ phone, role }) =>
      fetch(PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", phone, role, subscription: sub.toJSON() }),
      })
    ));
  } catch (_e) {
    // ignore — push может не поддерживаться
  }
}

export function usePushNotifications() {
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    const customerPhone = localStorage.getItem("customer_phone");
    const masterPhone = localStorage.getItem("master_phone");
    if (!customerPhone && !masterPhone) return;

    // Ключ кэша включает версию VAPID — при смене версии подписка обновится
    const cacheKey = `push_asked_${VAPID_VERSION}_${masterPhone || ""}_${customerPhone || ""}`;
    if (sessionStorage.getItem(cacheKey)) return;
    sessionStorage.setItem(cacheKey, "1");

    const phones: { phone: string; role: "customer" | "master" }[] = [];
    if (masterPhone) phones.push({ phone: masterPhone, role: "master" });
    if (customerPhone) phones.push({ phone: customerPhone, role: "customer" });

    const doSubscribe = () => subscribeAll(phones);

    if (Notification.permission === "granted") {
      doSubscribe();
      return;
    }

    if (Notification.permission === "denied") return;

    // Запрашиваем разрешение с небольшой задержкой
    setTimeout(async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        doSubscribe();
      }
    }, 3000);
  }, []);
}

export async function sendPushNotification(phone: string, title: string, body: string, url = "/") {
  try {
    await fetch(PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", phone, title, body, url }),
    });
  } catch (_e) {
    // ignore
  }
}