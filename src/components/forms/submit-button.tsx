"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  className,
  variant,
  size,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className={className} variant={variant} size={size} disabled={pending}>
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
