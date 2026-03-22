import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { HabitCheckIn } from "../backend";

interface HabitCalendarProps {
  checkIns: HabitCheckIn[];
  totalHabits: number;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function HabitCalendar({
  checkIns,
  totalHabits,
}: HabitCalendarProps) {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const firstDow = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const isCurrentMonth =
    view.year === today.getFullYear() && view.month === today.getMonth();

  const countByDate = new Map<string, number>();
  for (const ci of checkIns) {
    countByDate.set(ci.date, (countByDate.get(ci.date) ?? 0) + 1);
  }

  // Padding slots (0..firstDow-1) and day numbers (1..daysInMonth)
  const padSlots = Array.from({ length: firstDow }, (_, i) => i);
  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prev = () =>
    setView((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const next = () =>
    setView((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <div data-ocid="calendar.panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="calendar.pagination_prev"
            onClick={prev}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-base font-semibold text-foreground min-w-[150px] text-center">
            {MONTHS[view.month]} {view.year}
          </h3>
          <button
            type="button"
            data-ocid="calendar.pagination_next"
            onClick={next}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {!isCurrentMonth && (
          <Button
            data-ocid="calendar.today.button"
            variant="outline"
            size="sm"
            onClick={() =>
              setView({ year: today.getFullYear(), month: today.getMonth() })
            }
            className="text-xs"
          >
            Today
          </Button>
        )}
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {padSlots.map((i) => (
          <div key={`pad-${i}`} />
        ))}
        {dayNums.map((day) => {
          const dateStr = fmtDate(view.year, view.month, day);
          const count = countByDate.get(dateStr) ?? 0;
          const ratio = totalHabits > 0 ? count / totalHabits : 0;
          const isFuture = new Date(view.year, view.month, day) > today;
          const isToday = isCurrentMonth && day === today.getDate();
          const dot =
            ratio >= 1
              ? "bg-teal-accent"
              : ratio >= 0.5
                ? "bg-amber-400"
                : ratio > 0
                  ? "bg-amber-300/70"
                  : "";

          return (
            <div
              key={day}
              className={`flex flex-col items-center justify-center rounded-lg py-1.5 min-h-[40px] transition-colors ${
                isToday
                  ? "ring-2 ring-teal-accent bg-teal-accent/10"
                  : "hover:bg-secondary/50"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? "text-teal-accent font-bold"
                    : isFuture
                      ? "text-muted-foreground/40"
                      : "text-foreground"
                }`}
              >
                {day}
              </span>
              {!isFuture && (
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dot || "bg-border"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-teal-accent" />
          All done
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          Partial
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-border" />
          None
        </div>
      </div>
    </div>
  );
}
