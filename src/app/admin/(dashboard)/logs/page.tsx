export const dynamic = "force-dynamic";

import { LiveLogsTable } from "@/components/admin/live-logs-table";

export default function AdminLogsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Scraping лог ба хяналт</h1>
        <p className="mt-2 text-sm text-white/60">SWR-ээр 15 секунд тутам шинэчлэгдэнэ.</p>
      </div>
      <LiveLogsTable />
    </section>
  );
}
