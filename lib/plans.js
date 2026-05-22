export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    monthlyLimit: 1,
    price: 0,
    features: ["1 wedding/month", "Shot list only"]
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyLimit: null,
    price: 29,
    features: ["Unlimited weddings", "All outputs", "PDF export"]
  },
  studio: {
    id: "studio",
    name: "Studio",
    monthlyLimit: null,
    price: 59,
    features: ["Everything in Pro", "White-label PDFs", "Team seats"]
  }
};

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function hasUnlimitedUsage(plan) {
  return plan === "pro" || plan === "studio";
}

export function getPlanLimit(plan) {
  return PLANS[plan]?.monthlyLimit ?? PLANS.free.monthlyLimit;
}
