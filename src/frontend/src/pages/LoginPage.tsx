import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-mint-light flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 mint-blob opacity-60 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 mint-blob opacity-60 translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 bg-card rounded-2xl shadow-card p-10 w-full max-w-md flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-accent flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">
            HabitTracker
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Build better habits
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Track your daily habits, celebrate streaks, and watch your progress
            grow — day by day.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "\uD83D\uDD25 Streak Tracking",
            "\uD83D\uDCCA Progress Rings",
            "\uD83D\uDCC5 Calendar View",
            "\uD83C\uDFC6 Achievements",
          ].map((f) => (
            <span
              key={f}
              className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
            >
              {f}
            </span>
          ))}
        </div>

        <Button
          data-ocid="login.primary_button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full bg-teal-accent hover:bg-teal-accent/90 text-white font-semibold py-6 text-base rounded-xl"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Sign in to get started
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Secured by Internet Identity — no passwords needed.
        </p>
      </motion.div>

      <p className="relative z-10 mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
