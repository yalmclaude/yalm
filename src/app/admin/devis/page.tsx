import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { QuotesAdmin } from "@/components/QuotesAdmin";

export default async function AdminQuotesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-anthracite">Administration YALM</h1>
      </div>
      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <a href="/admin" className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-bordeaux">
          Catalogue &amp; réservations
        </a>
        <span className="border-b-2 border-bordeaux px-4 py-2.5 text-sm font-semibold text-bordeaux">Devis</span>
        <a href="/admin/coffrets" className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-bordeaux">
          Coffrets mariage
        </a>
      </div>
      <QuotesAdmin />
    </main>
  );
}
