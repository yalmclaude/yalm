// Business contact details shown on the site (quote requests, footer).
export const CONTACT_EMAIL = "yalm.events@gmail.com";
export const CONTACT_PHONE = "06 00 00 00 00";

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "").replace(/^0/, "+33")}`;
}
