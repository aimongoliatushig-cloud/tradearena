"use client";

import useSWR from "swr";

import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { jobStatusLabels } from "@/lib/labels";

type LogRow = {
  id: string;
  startedAt: string;
  jobType: string;
  status: keyof typeof jobStatusLabels;
  message?: string | null;
  room?: { title?: string | null } | null;
  trader?: { fullName?: string | null } | null;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Лог татаж чадсангүй.");
  }
  return response.json() as Promise<{ logs: LogRow[] }>;
};

function getTone(status: string) {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "danger";
    case "PARTIAL":
      return "warning";
    case "RUNNING":
      return "info";
    default:
      return "muted";
  }
}

export function LiveLogsTable() {
  const { data, error, isLoading } = useSWR("/api/admin/logs", fetcher, {
    refreshInterval: 15000,
  });

  if (isLoading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">Лог уншиж байна...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">Лог татах үед алдаа гарлаа.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead>Цаг</TableHead>
            <TableHead>Ажил</TableHead>
            <TableHead>Өрөө</TableHead>
            <TableHead>Трейдер</TableHead>
            <TableHead>Төлөв</TableHead>
            <TableHead>Тайлбар</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data?.logs ?? []).map((log) => (
            <TableRow key={log.id} className="border-white/8">
              <TableCell className="text-white/55">{formatDateTime(log.startedAt)}</TableCell>
              <TableCell className="text-white">{log.jobType}</TableCell>
              <TableCell className="text-white/75">{log.room?.title ?? "-"}</TableCell>
              <TableCell className="text-white/75">{log.trader?.fullName ?? "-"}</TableCell>
              <TableCell>
                <StatusBadge label={jobStatusLabels[log.status as keyof typeof jobStatusLabels]} tone={getTone(log.status)} />
              </TableCell>
              <TableCell className="max-w-xl text-sm text-white/55">{log.message ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
