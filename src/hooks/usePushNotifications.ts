import { useEffect, useRef } from "react";

const PUSH_URL = "https://functions.poehali.dev/272080b1-1a80-40bd-8201-0951cb380c57";
// Публичный VAPID-ключ — будет подставлен после добавления секрета
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function subscribeUser(phone: string, role: "customer" | "master") {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (!VAPID_PUBLIC_KEY) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub = existing || await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await fetch(PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "subscribe", phone, role, subscription: sub.toJSON() }),
    });
  } catch (_e) {
    // ignore — push может не поддерживаться
  }
}

export function usePushNotifications() {
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    const customerPhone = localStorage.getItem("customer_phone");
    const masterPhone = localStorage.getItem("master_phone");
    if (!customerPhone && !masterPhone) return;

    asked.current = true;

    const phone = masterPhone || customerPhone || "";
    const role: "customer" | "master" = masterPhone ? "master" : "customer";

    if (Notification.permission === "granted") {
      subscribeUser(phone, role);
      return;
    }

    if (Notification.permission === "denied") return;

    // Запрашиваем разрешение с небольшой задержкой
    setTimeout(async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        subscribeUser(phone, role);
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
