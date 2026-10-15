export type SupportedLocale = "vi" | "en";

const STRINGS: Record<SupportedLocale, Record<string, string>> = {
  vi: {
    "app.name": "Domanage · KTX FPT",
    "nav.overview": "Tổng quan",
    "nav.room": "Phòng của tôi",
    "nav.booking": "Đặt giường",
    "nav.billing": "Điện nước & VietQR",
    "nav.maintenance": "Báo hỏng",
    "nav.curfew": "Giới nghiêm & Ra vào",
    "nav.visitor": "Khách thăm",
    "nav.notices": "Bảng tin",
    "nav.market": "Chợ & Thất lạc",
    "nav.manager": "Quản lý",
    "nav.profile": "Hồ sơ",
    "curfew.rule": "Giờ giới nghiêm 23:00",
    "billing.pay": "Thanh toán VietQR",
  },
  en: {
    "app.name": "Domanage · FPT Dorm",
    "nav.overview": "Overview",
    "nav.room": "My Room",
    "nav.booking": "Book a bed",
    "nav.billing": "Utilities & VietQR",
    "nav.maintenance": "Maintenance",
    "nav.curfew": "Curfew & Access",
    "nav.visitor": "Visitors",
    "nav.notices": "Notices",
    "nav.market": "Market & Lost",
    "nav.manager": "Manager",
    "nav.profile": "Profile",
    "curfew.rule": "Curfew 11:00 PM",
    "billing.pay": "Pay via VietQR",
  },
};

export function getLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem("dms_locale");
    if (saved === "en" || saved === "vi") return saved;
  } catch {
    // ignore
  }
  return "vi";
}

export function setLocale(locale: SupportedLocale): void {
  try {
    localStorage.setItem("dms_locale", locale);
  } catch {
    // ignore
  }
  document.documentElement.lang = locale;
}

export function t(key: string): string {
  const locale = getLocale();
  return STRINGS[locale][key] ?? STRINGS.vi[key] ?? key;
}

export const I18N_KEYS = Object.keys(STRINGS.vi);
