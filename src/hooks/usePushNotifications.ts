import { useEffect } from "react";

const PUSH_URL = "https://functions.poehali.dev/272080b1-1a80-40bd-8201-0951cb380c57";
const VAPID_VERSION = "v14";

let vapidPublicKeyCache: string | null = null;

async function getVapidPublicKey(): Promise<string> {
  if (vapidPublicKeyCache) return vapidPublicKeyCache;
  const res = await fetch(PUSH_URL);
  const data = await res.json();
  vapidPublicKeyCache = data.vapid_public_key || "";
  return vapidPublicKeyCache;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function subscribeAll(phones: { phone: string; role: "customer" | "master" }[]) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const vapidKey = await getVapidPublicKey();
  if (!vapidKey) return;

  try {
    const reg = await navigator.serviceWorker.ready;

    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    await Promise.all(phones.map(({ phone, role }) =>
      fetch(PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", phone, role, subscription: sub.toJSON() }),
      })
    ));
  } catch (_e) {
    // ignore
  }
}

export function usePushNotifications() {
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    const customerPhone = localStorage.getItem("customer_phone");
    const masterPhone = localStorage.getItem("master_phone");
    if (!customerPhone && !masterPhone) return;

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