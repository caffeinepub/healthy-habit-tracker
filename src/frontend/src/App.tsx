import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import Layout from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useAddDefaultHabits, useHabits } from "./hooks/useQueries";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MyHabitsPage from "./pages/MyHabitsPage";

export type Page = "dashboard" | "habits";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [page, setPage] = useState<Page>("dashboard");
  const { data: habits, isSuccess: habitsLoaded } = useHabits();
  const addDefaultHabits = useAddDefaultHabits();
  const { isFetching: actorFetching } = useActor();
  const hasSetupDefaults = useRef(false);

  useEffect(() => {
    if (
      identity &&
      habitsLoaded &&
      habits &&
      habits.length === 0 &&
      !actorFetching &&
      !hasSetupDefaults.current &&
      !addDefaultHabits.isPending
    ) {
      hasSetupDefaults.current = true;
      addDefaultHabits.mutate();
    }
  }, [identity, habitsLoaded, habits, actorFetching, addDefaultHabits]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-teal-accent border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading HabitTracker…</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <Layout page={page} setPage={setPage}>
      {page === "dashboard" ? (
        <DashboardPage setPage={setPage} />
      ) : (
        <MyHabitsPage />
      )}
      <Toaster />
    </Layout>
  );
}
