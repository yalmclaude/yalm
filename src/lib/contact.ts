// Business contact details shown on the site (quote requests, footer).
export const CONTACT_EMAIL = "yalm.events@gmail.com";
export const CONTACT_PHONE = "06 07 47 45 43";

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "").replace(/^0/, "+33")}`;
}

// Social accounts (all under the handle yalm.events).
export const SOCIAL_LINKS = [
  { name: "Instagram", url: "https://www.instagram.com/yalm.events" },
  { name: "TikTok", url: "https://www.tiktok.com/@yalm.events" },
  { name: "Snapchat", url: "https://www.snapchat.com/add/yalm.events" },
] as const;
