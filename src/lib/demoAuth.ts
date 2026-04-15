export type DemoRole = "buyer" | "seller" | "admin";

export type DemoSession = {
  role: DemoRole;
  name: string;
  email: string;
  company: string;
};

const STORAGE_KEY = "raw-demo-session";

const DEMO_USERS: Record<DemoRole, DemoSession> = {
  buyer: {
    role: "buyer",
    name: "Demo Buyer",
    email: "buyer@demo.com",
    company: "Demo Company",
  },
  seller: {
    role: "seller",
    name: "Demo Seller",
    email: "seller@demo.com",
    company: "Centro de Servicio Demo",
  },
  admin: {
    role: "admin",
    name: "RAW Admin",
    email: "admin@raw.com",
    company: "RAW",
  },
};

export function getDemoUser(role: DemoRole): DemoSession {
  return DEMO_USERS[role];
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function setDemoSession(role: DemoRole) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USERS[role]));
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}