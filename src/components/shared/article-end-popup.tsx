"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BLOG_ANALYTICS_EVENT_TYPE } from "@/lib/blog-analytics";
import { sendBlogAnalyticsEvent } from "@/lib/blog-analytics-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type PopupData = {
  title: string;
  body: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  ctaLabel: string;
  ctaUrl: string;
};

export function ArticleEndPopup({
  popup,
  popupId,
  postId,
}: {
  popup: PopupData;
  popupId: string;
  postId: string;
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedRef = useRef(false);
  const [open, setOpen] = useState(false);

  function openPopup() {
    setOpen(true);

    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      void sendBlogAnalyticsEvent({
        postId,
        popupId,
        eventType: BLOG_ANALYTICS_EVENT_TYPE.POPUP_SHOWN,
      });
    }
  }

  useEffect(() => {
    const node = triggerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          openPopup();
          observer.disconnect();
        }
      },
      { threshold: 0.9 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={triggerRef} className="ftmo-panel mt-10 space-y-4 p-6">
        <div className="ftmo-kicker">Сорилтод нэгдэх</div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{popup.title}</h3>
          <p className="text-sm leading-7 text-white/60">{popup.body}</p>
        </div>
        <Button onClick={openPopup}>{popup.ctaLabel}</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[1.75rem] border border-white/10 bg-[#0f151c] p-0 text-white sm:max-w-2xl">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative min-h-64 bg-black/20">
              {popup.imageUrl ? (
                <Image src={popup.imageUrl} alt={popup.title} fill className="object-cover" />
              ) : popup.videoUrl ? (
                <iframe
                  src={popup.videoUrl}
                  title={popup.title}
                  className="h-full min-h-64 w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full min-h-64 items-center justify-center text-sm text-white/45">Медиа байхгүй</div>
              )}
            </div>
            <div className="space-y-5 p-6">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-semibold tracking-[-0.03em] text-white">{popup.title}</DialogTitle>
                <DialogDescription className="text-sm leading-7 text-white/65">{popup.body}</DialogDescription>
              </DialogHeader>
              {popup.videoUrl && popup.imageUrl ? (
                <Link href={popup.videoUrl} className="text-sm text-[#95e8d5] underline underline-offset-4" target="_blank">
                  Видео үзэх
                </Link>
              ) : null}
              <Button render={<Link href={popup.ctaUrl} />}>{popup.ctaLabel}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
