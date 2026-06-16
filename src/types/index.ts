export type Lang = "es" | "en";

export type MenuItem = {
  id?: string;
  name: string;
  enName?: string;
  price?: string;
  image: string;
  desc: string;
  enDesc: string;
  isAvailable?: boolean;
};

export type LegalModalType = null | "terms" | "privacy" | "food";
