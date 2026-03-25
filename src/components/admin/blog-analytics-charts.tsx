"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Bucket = {
  guestReads: number;
  key: string;
  label: string;
  loggedInReads: number;
  pageViews: number;
  previewViews: number;
  fullReads: number;
  popupShows: number;
};

type HourBucket = {
  fullReads: number;
  hour: number;
  label: string;
  pageViews: number;
};

export function BlogAnalyticsCharts({
  buckets,
  hours,
}: {
  buckets: Bucket[];
  hours: HourBucket[];
}) {
  const topHourData = hours.filter((hour) => hour.pageViews > 0 || hour.fullReads > 0).slice(0, 8);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
      <div className="glass-panel p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Blog Activity Over Time</h2>
          <p className="mt-2 text-sm text-white/55">Views, previews, full reads, and popup impressions across the selected range.</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buckets}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(7,16,25,0.96)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "18px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="pageViews"
                stroke="rgb(245, 245, 245)"
                fill="rgba(245, 245, 245, 0.08)"
                strokeWidth={2}
                name="Post Views"
              />
              <Area
                type="monotone"
                dataKey="previewViews"
                stroke="rgb(255, 186, 87)"
                fill="rgba(255, 186, 87, 0.12)"
                strokeWidth={2}
                name="Preview Views"
              />
              <Area
                type="monotone"
                dataKey="fullReads"
                stroke="rgb(24, 199, 162)"
                fill="rgba(24, 199, 162, 0.18)"
                strokeWidth={2}
                name="Full Reads"
              />
              <Area
                type="monotone"
                dataKey="popupShows"
                stroke="rgb(75, 180, 255)"
                fill="rgba(75, 180, 255, 0.12)"
                strokeWidth={2}
                name="Popup Shows"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Reader Mix</h2>
            <p className="mt-2 text-sm text-white/55">Logged-in versus guest full reads by period bucket.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(7,16,25,0.96)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "18px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="loggedInReads" fill="rgba(24, 199, 162, 0.92)" radius={[8, 8, 0, 0]} name="Logged In" />
                <Bar dataKey="guestReads" fill="rgba(255, 154, 90, 0.88)" radius={[8, 8, 0, 0]} name="Guests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Top Hours</h2>
            <p className="mt-2 text-sm text-white/55">Best-performing local reading hours by blog opens inside the selected range.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topHourData} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="rgba(255,255,255,0.38)"
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(7,16,25,0.96)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "18px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="pageViews" fill="rgba(243, 205, 108, 0.9)" radius={[0, 8, 8, 0]} name="Post Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
