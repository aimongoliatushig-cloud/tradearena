import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function FlashMessage({ success, error }: { success?: string; error?: string }) {
  if (!success && !error) return null;

  const isError = Boolean(error);
  const message = error || success;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        isError
          ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
      }`}
    >
      <div className="flex items-center gap-2">
        {isError ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}
        <span>{message}</span>
      </div>
    </div>
  );
}
