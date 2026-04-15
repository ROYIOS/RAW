import type { Listing } from "@/src/lib/models";

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "raw-001",
    grade: "409",
    finish: "2B",
    thickness_mm: 1.5,
    width_mm: 1219,
    price_per_mt: 1850,
    available_mt: 24,
    location: "San Luis Potosí",
  },
  {
    id: "raw-002",
    grade: "304L",
    finish: "2B",
    thickness_mm: 1.2,
    width_mm: 1500,
    price_per_mt: 2650,
    available_mt: 18,
    location: "Querétaro",
  },
  {
    id: "raw-003",
    grade: "430",
    finish: "BA",
    thickness_mm: 0.8,
    width_mm: 1000,
    price_per_mt: 1620,
    available_mt: 32,
    location: "Monterrey",
  },
];