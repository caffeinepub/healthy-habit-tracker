import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  CheckCircle2,
  Flame,
  Grid3X3,
  Heart,
  Quote,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Page } from "../App";
import { HabitCategory } from "../backend";
import CircularProgress from "../components/CircularProgress";
import HabitCalendar from "../components/HabitCalendar";
import {
  useAllCheckIns,
  useCheckInHabit,
  useHabitStats,
  useHabits,
  useUserProfile,
} from "../hooks/useQueries";

const QUOTES = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
  },
  {
    text: "You don't rise to the level of your goals, you fall to the level of your systems.",
    author: "James Clear",
  },
  {
    text: "Consistency is the key to achieving and maintaining momentum.",
    author: "Darren Hardy",
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "A year from now you may wish you had started today.",
    author: "Karen Lamb",
  },
];

const CAT_META: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  all: {
    icon: <Grid3X3 className="w-4 h-4" />,
    label: "All Habits",
    color: "",
  },
  [HabitCategory.health]: {
    icon: <Heart className="w-4 h-4" />,
    label: "Health",
    color: "bg-rose-100 text-rose-600",
  },
  [HabitCategory.wellness]: {
    icon: <Sparkles className="w-4 h-4" />,
    label: "Wellness",
    color: "bg-emerald-100 text-emerald-600",
  },
  [HabitCategory.productivity]: {
    icon: <Zap className="w-4 h-4" />,
    label: "Productivity",
    color: "bg-amber-100 text-amber-600",
  },
  [HabitCategory.mindfulness]: {
    icon: <Brain className="w-4 h-4" />,
    label: "Mindfulness",
    color: "bg-violet-100 text-violet-600",
  },
};

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start.getTime()) / 86400000);
  return QUOTES[day % QUOTES.length];
}

export default function DashboardPage({
  setPage: _setPage,
}: { setPage: (p: Page) => void }) {
  const { data: habits, isLoading } = useHabits();
  const { data: stats } = useHabitStats();
  const { data: allCheckIns } = useAllCheckIns();
  const { data: profile } = useUserProfile();
  const checkInMutation = useCheckInHabit();

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [pendingCheckIns, setPendingCheckIns] = useState<Set<string>>(
    new Set(),
  );

  const today = getTodayDate();
  const quote = getDailyQuote();

  const completedTodayIds = useMemo(() => {
    const ids = new Set<string>();
    if (allCheckIns)
      for (const ci of allCheckIns) {
        if (ci.date === today) ids.add(String(ci.habitId));
      }
    return ids;
  }, [allCheckIns, today]);

  const isCompletedToday = (habitId: bigint) =>
    pendingCheckIns.has(`${habitId}-${today}`) ||
    completedTodayIds.has(String(habitId));

  const handleCheckIn = (habitId: bigint) => {
    if (isCompletedToday(habitId)) return;
    const key = `${habitId}-${today}`;
    setPendingCheckIns((prev) => new Set([...prev, key]));
    checkInMutation.mutate(
      { habitId, date: today },
      {
        onError: () =>
          setPendingCheckIns((prev) => {
            const n = new Set(prev);
            n.delete(key);
            return n;
          }),
      },
    );
  };

  const filteredHabits = useMemo(() => {
    if (!habits) return [];
    return selectedCat === "all"
      ? habits
      : habits.filter((h) => h.category === selectedCat);
  }, [habits, selectedCat]);

  const completedToday =
    habits?.filter((h) => isCompletedToday(h.id)).length ?? 0;
  const totalHabits = habits?.length ?? 0;
  const todayProgress =
    totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  const featuredHabits = habits?.slice(0, 3) ?? [];
  const displayName = profile?.name ? profile.name.split(" ")[0] : "there";

  const topStreaks = useMemo(() => {
    if (!stats) return [];
    return [...stats]
      .sort((a, b) => Number(b.currentStreak - a.currentStreak))
      .slice(0, 4);
  }, [stats]);

  const maxStreak = useMemo(() => {
    if (!stats || stats.length === 0) return 0;
    return Math.max(...stats.map((s) => Number(s.currentStreak)));
  }, [stats]);

  const achievements = useMemo(() => {
    const r: { label: string; emoji: string; days: number }[] = [];
    if (maxStreak >= 7)
      r.push({ label: "Week Warrior", emoji: "\uD83C\uDFC5", days: 7 });
    if (maxStreak >= 30)
      r.push({ label: "Monthly Master", emoji: "\uD83E\uDD47", days: 30 });
    if (maxStreak >= 100)
      r.push({ label: "Century Champion", emoji: "\uD83C\uDFC6", days: 100 });
    return r;
  }, [maxStreak]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          {getGreeting()}, {displayName}! \uD83D\uDC4B
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          {completedToday === totalHabits && totalHabits > 0
            ? "You've completed all habits today \u2014 outstanding! \uD83C\uDF89"
            : `You've completed ${completedToday} of ${totalHabits} habits today. Keep it up!`}
        </p>
      </motion.div>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 mb-6">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex flex-col gap-1">
                {["all", ...Object.values(HabitCategory)].map((cat) => {
                  const meta = CAT_META[cat];
                  const count =
                    cat === "all"
                      ? (habits?.length ?? 0)
                      : (habits?.filter((h) => h.category === cat).length ?? 0);
                  return (
                    <button
                      type="button"
                      key={cat}
                      data-ocid={`filter.${cat}.tab`}
                      onClick={() => setSelectedCat(cat)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCat === cat
                          ? "bg-teal-accent text-white"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span
                        className={`text-xs rounded-full px-1.5 py-0.5 ${
                          selectedCat === cat
                            ? "bg-white/20 text-white"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {habits && habits.length > 0 && (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Active Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex flex-col gap-2">
                {habits.slice(0, 5).map((h) => {
                  const done = isCompletedToday(h.id);
                  return (
                    <div key={String(h.id)} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground truncate max-w-[140px]">
                          {h.emoji} {h.name}
                        </span>
                        {done && (
                          <span className="text-teal-accent">\u2713</span>
                        )}
                      </div>
                      <div className="h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-teal-accent rounded-full transition-all duration-500"
                          style={{ width: done ? "100%" : "0%" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* CENTER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col gap-4"
        >
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">
                  Today's Progress
                </CardTitle>
                <span className="text-sm font-semibold text-teal-accent">
                  {completedToday}/{totalHabits}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
                <div
                  className="h-full bg-teal-accent rounded-full transition-all duration-700"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex gap-6 justify-center py-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-20 h-24 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 justify-center flex-wrap py-2">
                  {featuredHabits.map((h) => {
                    const done = isCompletedToday(h.id);
                    const streak = Number(
                      stats?.find((s) => s.habit.id === h.id)?.currentStreak ??
                        0,
                    );
                    return (
                      <CircularProgress
                        key={String(h.id)}
                        value={done ? 100 : 0}
                        size={88}
                        strokeWidth={8}
                        emoji={h.emoji}
                        label={h.name}
                        sublabel={
                          streak > 0
                            ? `\uD83D\uDD25 ${streak}d`
                            : done
                              ? "Done!"
                              : "Not yet"
                        }
                        completed={done}
                      />
                    );
                  })}
                  {featuredHabits.length === 0 && (
                    <p className="text-muted-foreground text-sm py-4">
                      No habits yet \u2014 add some to get started!
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">
                Today's Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : filteredHabits.length === 0 ? (
                <div
                  data-ocid="habits.empty_state"
                  className="py-10 text-center text-muted-foreground text-sm px-4"
                >
                  No habits in this category yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredHabits.map((habit, idx) => {
                    const done = isCompletedToday(habit.id);
                    const streak = Number(
                      stats?.find((s) => s.habit.id === habit.id)
                        ?.currentStreak ?? 0,
                    );
                    const cat = CAT_META[habit.category];
                    return (
                      <div
                        key={String(habit.id)}
                        data-ocid={`habits.item.${idx + 1}`}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${done ? "bg-teal-accent/5" : "hover:bg-secondary/40"}`}
                      >
                        <button
                          type="button"
                          data-ocid={`habits.checkbox.${idx + 1}`}
                          onClick={() => handleCheckIn(habit.id)}
                          disabled={done}
                          aria-label={`Mark ${habit.name} as done`}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            done
                              ? "bg-teal-accent border-teal-accent"
                              : "border-border hover:border-teal-accent"
                          }`}
                        >
                          {done && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </button>
                        <span className="text-xl flex-shrink-0">
                          {habit.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                            >
                              {habit.name}
                            </span>
                            {cat.color && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}
                              >
                                {cat.label}
                              </span>
                            )}
                          </div>
                          {habit.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {habit.description}
                            </p>
                          )}
                        </div>
                        {streak > 0 && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-orange-500 flex-shrink-0">
                            <Flame className="w-3.5 h-3.5" />
                            {streak}d
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Streak Leaders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {topStreaks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Complete habits to build streaks!
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {topStreaks.map((s, idx) => (
                    <div
                      key={String(s.habit.id)}
                      data-ocid={`streaks.item.${idx + 1}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-lg">{s.habit.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {s.habit.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Number(s.totalCheckIns)} total
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-0.5 text-orange-500">
                          <Flame className="w-3 h-3" />
                          <span className="text-xs font-bold">
                            {Number(s.currentStreak)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          streak
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Completion Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex flex-col gap-2">
                {filteredHabits.slice(0, 4).map((h, idx) => {
                  const done = isCompletedToday(h.id);
                  const stat = stats?.find((s) => s.habit.id === h.id);
                  const total = Number(stat?.totalCheckIns ?? 0);
                  return (
                    <div key={String(h.id)} className="flex items-center gap-2">
                      <span className="text-sm">{h.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-foreground truncate max-w-[100px]">
                            {h.name}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {total}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-secondary overflow-hidden mt-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${done ? "bg-teal-accent" : "bg-muted"}`}
                            style={{ width: done ? "100%" : "20%" }}
                          />
                        </div>
                      </div>
                      <div
                        data-ocid={`week.toggle.${idx + 1}`}
                        className={`w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center ${
                          done
                            ? "bg-teal-accent border-teal-accent"
                            : "border-border"
                        }`}
                      >
                        {done && <TrendingUp className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="shadow-card mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Completion History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HabitCalendar
              checkIns={allCheckIns ?? []}
              totalHabits={totalHabits}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Quote className="w-5 h-5 text-teal-accent" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Quote of the Day
                  </span>
                </div>
                <div className="border-l-4 border-teal-accent pl-4">
                  <p className="text-foreground font-medium leading-relaxed italic">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    &mdash; {quote.author}
                  </p>
                </div>
              </div>
              {achievements.length > 0 && (
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Achievements
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {achievements.map((a) => (
                      <div
                        key={a.label}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 border border-amber-200"
                      >
                        <span className="text-base">{a.emoji}</span>
                        <div>
                          <p className="text-xs font-bold text-amber-700">
                            {a.label}
                          </p>
                          <p className="text-xs text-amber-600">
                            {a.days} day streak
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
