export const dynamic = "force-dynamic";

import Link from "next/link";

import { BlogAnalyticsCharts } from "@/components/admin/blog-analytics-charts";
import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BLOG_ANALYTICS_RANGE_LABELS, BLOG_ANALYTICS_RANGE_OPTIONS, type BlogAnalyticsRange } from "@/lib/blog-analytics";
import { dayjs } from "@/lib/dayjs";
import { formatDateTime } from "@/lib/format";
import { getBlogAnalyticsDashboard } from "@/server/services/blog-analytics-service";
import { getAdminBlogPost } from "@/server/services/blog-service";
import { getDefaultScheduleConfig } from "@/server/services/settings-service";

function isRange(value: string | undefined): value is BlogAnalyticsRange {
  return Boolean(value && BLOG_ANALYTICS_RANGE_OPTIONS.includes(value as BlogAnalyticsRange));
}

export default async function AdminBlogAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rangeParam = typeof params.range === "string" ? params.range : undefined;
  const postId = typeof params.postId === "string" ? params.postId : undefined;
  const range = isRange(rangeParam) ? rangeParam : "weekly";
  const { timezone } = await getDefaultScheduleConfig();
  const [analytics, selectedPost] = await Promise.all([
    getBlogAnalyticsDashboard(range, timezone, postId),
    postId ? getAdminBlogPost(postId) : Promise.resolve(null),
  ]);
  const windowLabel = `${dayjs(analytics.start).tz(timezone).format("YYYY.MM.DD HH:mm")} to ${dayjs(analytics.end)
    .tz(timezone)
    .subtract(1, "minute")
    .format("YYYY.MM.DD HH:mm")} (${timezone})`;

  function buildAnalyticsHref(nextRange: BlogAnalyticsRange) {
    const query = new URLSearchParams({ range: nextRange });
    if (postId) {
      query.set("postId", postId);
    }

    return `/admin/blog/analytics?${query.toString()}`;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {selectedPost ? `Blog Analytics: ${selectedPost.title}` : "Blog Analytics"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {BLOG_ANALYTICS_RANGE_LABELS[range]} view of post opens, guest previews, full reads, popup impressions, and top-performing posts.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/35">{windowLabel}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {BLOG_ANALYTICS_RANGE_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={option === range ? "default" : "outline"}
                render={<Link href={buildAnalyticsHref(option)} />}
              >
                {BLOG_ANALYTICS_RANGE_LABELS[option]}
              </Button>
            ))}
          </div>
          {selectedPost ? (
            <Button variant="outline" render={<Link href="/admin/blog/analytics" />}>
              All Posts
            </Button>
          ) : null}
          <Button variant="secondary" render={<Link href="/admin/blog/posts" />}>
            Blog Posts
          </Button>
          <Button variant="outline" render={<Link href="/admin/settings" />}>
            Report Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <MetricCard label="Post Views" value={String(analytics.totalViews)} hint="All blog detail page opens" />
        <MetricCard label="Preview Views" value={String(analytics.previewViews)} hint="Guest previews on login-gated posts" />
        <MetricCard label="Full Reads" value={String(analytics.totalFullReads)} hint="Bottom-of-article completions" />
        <MetricCard label="Logged In" value={String(analytics.loggedInReads)} hint="Full reads by signed-in readers" />
        <MetricCard label="Guests" value={String(analytics.guestReads)} hint="Guest full reads on open posts" />
        <MetricCard label="Popup Shows" value={String(analytics.popupShows)} hint="Article-end popup impressions" />
        <MetricCard label="Unique Readers" value={String(analytics.uniqueReaders)} hint="Distinct readers who fully read" />
      </div>

      <BlogAnalyticsCharts buckets={analytics.buckets} hours={analytics.hours} />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Top Posts</h2>
            <p className="mt-2 text-sm text-white/55">Which articles drove the most views, previews, full reads, and popup impressions.</p>
          </div>
          <Table className="text-white/80">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/55">Post</TableHead>
                <TableHead className="text-right text-white/55">Views</TableHead>
                <TableHead className="text-right text-white/55">Previews</TableHead>
                <TableHead className="text-right text-white/55">Reads</TableHead>
                <TableHead className="text-right text-white/55">Logged In</TableHead>
                <TableHead className="text-right text-white/55">Guests</TableHead>
                <TableHead className="text-right text-white/55">Popups</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.posts.length ? (
                analytics.posts.slice(0, 10).map((post) => (
                  <TableRow key={post.postId} className="border-white/10 hover:bg-white/[0.03]">
                    <TableCell className="max-w-[320px] whitespace-normal">
                      <div className="font-medium text-white">{post.postTitle}</div>
                      <div className="mt-1 text-xs text-white/45">{post.postSlug}</div>
                    </TableCell>
                    <TableCell className="text-right">{post.pageViews}</TableCell>
                    <TableCell className="text-right">{post.previewViews}</TableCell>
                    <TableCell className="text-right">{post.fullReads}</TableCell>
                    <TableCell className="text-right">{post.loggedInReads}</TableCell>
                    <TableCell className="text-right">{post.guestReads}</TableCell>
                    <TableCell className="text-right">{post.popupShows}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={7} className="py-10 text-center text-white/45">
                    No blog analytics events yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="glass-panel p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Top Readers</h2>
            <p className="mt-2 text-sm text-white/55">
              {selectedPost
                ? "Readers ranked by full reads and overall activity for this post."
                : "Readers ranked by full reads and overall activity across all blog posts."}
            </p>
          </div>
          <Table className="text-white/80">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/55">Reader</TableHead>
                <TableHead className="text-white/55">Type</TableHead>
                <TableHead className="text-right text-white/55">Views</TableHead>
                <TableHead className="text-right text-white/55">Previews</TableHead>
                <TableHead className="text-right text-white/55">Reads</TableHead>
                <TableHead className="text-right text-white/55">Popups</TableHead>
                <TableHead className="text-right text-white/55">Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.readers.length ? (
                analytics.readers.slice(0, 10).map((reader) => (
                  <TableRow key={reader.readerKey} className="border-white/10 hover:bg-white/[0.03]">
                    <TableCell className="max-w-[220px] whitespace-normal">
                      <div className="font-medium text-white">{reader.readerLabel}</div>
                      {reader.readerEmail ? <div className="mt-1 text-xs text-white/45">{reader.readerEmail}</div> : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reader.isAuthenticated ? "default" : "outline"}>
                        {reader.isAuthenticated ? "Logged In" : "Guest"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{reader.pageViews}</TableCell>
                    <TableCell className="text-right">{reader.previewViews}</TableCell>
                    <TableCell className="text-right">{reader.fullReads}</TableCell>
                    <TableCell className="text-right">{reader.popupShows}</TableCell>
                    <TableCell className="text-right text-xs text-white/50">{formatDateTime(reader.lastActivityAt)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={7} className="py-10 text-center text-white/45">
                    No reader data yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Full Readers</h2>
          <p className="mt-2 text-sm text-white/55">
            {selectedPost
              ? "Latest full-article read completions for this post."
              : "Latest full-article read completions across the public blog."}
          </p>
        </div>
        <Table className="text-white/80">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/55">When</TableHead>
              <TableHead className="text-white/55">Reader</TableHead>
              <TableHead className="text-white/55">Article</TableHead>
              <TableHead className="text-white/55">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics.recentFullReads.length ? (
              analytics.recentFullReads.map((event) => (
                <TableRow key={event.id} className="border-white/10 hover:bg-white/[0.03]">
                  <TableCell className="text-xs text-white/50">{formatDateTime(event.occurredAt)}</TableCell>
                  <TableCell className="max-w-[220px] whitespace-normal">
                    <div className="font-medium text-white">{event.readerLabel}</div>
                    {event.readerEmail ? <div className="mt-1 text-xs text-white/45">{event.readerEmail}</div> : null}
                  </TableCell>
                  <TableCell className="max-w-[320px] whitespace-normal">
                    <div className="font-medium text-white">{event.postTitle}</div>
                    <div className="mt-1 text-xs text-white/45">{event.postSlug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.isAuthenticated ? "default" : "outline"}>
                      {event.isAuthenticated ? "Logged In" : "Guest"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableCell colSpan={4} className="py-10 text-center text-white/45">
                  No full article reads recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
