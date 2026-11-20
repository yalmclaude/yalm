import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/Brand";

export const metadata: Metadata = { title: "Contact — YALM Events" };

// The footer is the contact block (phone, email, socials); here it is the whole page.
export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col justify-end bg-cream [&>footer]:mt-0">
        <SiteFooter />
      </main>
    </>
  );
}
