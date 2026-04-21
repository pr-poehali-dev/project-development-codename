export type MasterTab =
  | "balance"
  | "history"
  | "responses"
  | "services"
  | "profile"
  | "inquiries"
  | "referral";

export function getInitialTab(): MasterTab {
  const initialTab = new URLSearchParams(window.location.search).get("tab");
  if (
    initialTab === "services" ||
    initialTab === "responses" ||
    initialTab === "history" ||
    initialTab === "profile" ||
    initialTab === "inquiries" ||
    initialTab === "referral"
  ) {
    return initialTab as MasterTab;
  }
  return "balance";
}

export function getInitialPaymentId(): string | null {
  return new URLSearchParams(window.location.search).get("payment_id");
}
