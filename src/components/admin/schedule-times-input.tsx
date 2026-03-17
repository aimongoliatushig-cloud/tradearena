"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

function buildInitialTimes(defaultTimes: string[]) {
  return defaultTimes.length ? defaultTimes : [""];
}

export function ScheduleTimesInput({
  name,
  defaultTimes,
}: {
  name: string;
  defaultTimes: string[];
}) {
  const [times, setTimes] = useState(() => buildInitialTimes(defaultTimes));

  const serializedTimes = times
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");

  function updateTime(index: number, nextValue: string) {
    setTimes((current) => current.map((value, currentIndex) => (currentIndex === index ? nextValue : value)));
  }

  function addTime() {
    setTimes((current) => [...current, ""]);
  }

  function removeTime(index: number) {
    setTimes((current) => {
      if (current.length === 1) {
        return [""];
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={serializedTimes} />

      <div className="space-y-2">
        {times.map((value, index) => (
          <div key={`${index}-${value}`} className="flex items-center gap-2">
            <input
              type="time"
              step={60}
              value={value}
              onChange={(event) => updateTime(index, event.target.value)}
              className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
            />
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => removeTime(index)} aria-label="Remove time">
              <X />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" size="sm" variant="outline" onClick={addTime}>
          <Plus />
          Add time
        </Button>
        <div className="text-xs text-white/55">Each room can run multiple checks per day. Empty rows are ignored.</div>
      </div>
    </div>
  );
}
