import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  ChevronDown,
  Heart,
  LayoutDashboard,
  ListTodo,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

interface LayoutProps {
  children: ReactNode;
  page: Page;
  setPage: (p: Page) => void;
}

export default function Layout({ children, page, setPage }: LayoutProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useUserProfile();

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principalStr.slice(0, 5);
  const displayName = profile?.name || `User ${shortPrincipal}`;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-mint-light">
      <header
        className="sticky top-0 z-40"
        style={{ backgroundColor: "oklch(0.33 0.065 196)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage("dashboard")}
            className="flex items-center gap-2.5"
            data-ocid="nav.link"
          >
            <div className="w-8 h-8 rounded-full bg-teal-accent flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              HabitTracker
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {(["dashboard", "habits"] as Page[]).map((p) => (
              <button
                type="button"
                key={p}
                data-ocid={`nav.${p}.link`}
                onClick={() => setPage(p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === p ? "text-white" : "text-white/70 hover:text-white"
                }`}
                style={
                  page === p
                    ? { backgroundColor: "oklch(0.40 0.06 192)" }
                    : undefined
                }
              >
                {p === "dashboard" ? (
                  <LayoutDashboard className="w-4 h-4" />
                ) : (
                  <ListTodo className="w-4 h-4" />
                )}
                {p === "dashboard" ? "Dashboard" : "My Habits"}
              </button>
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid="nav.user.dropdown_menu"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-teal-accent text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-white text-sm font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                data-ocid="nav.logout.button"
                onClick={clear}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="md:hidden flex"
          style={{ borderTop: "1px solid oklch(0.40 0.06 192 / 0.5)" }}
        >
          {(["dashboard", "habits"] as Page[]).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPage(p)}
              data-ocid={`nav.mobile.${p}.link`}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                page === p ? "text-white" : "text-white/60"
              }`}
              style={
                page === p
                  ? { backgroundColor: "oklch(0.40 0.06 192)" }
                  : undefined
              }
            >
              {p === "dashboard" ? (
                <LayoutDashboard className="w-4 h-4" />
              ) : (
                <ListTodo className="w-4 h-4" />
              )}
              {p === "dashboard" ? "Dashboard" : "My Habits"}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-0 w-96 h-96 mint-blob opacity-40 -translate-x-1/3 -translate-y-1/3" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 mint-blob opacity-40 translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10">{children}</div>
      </main>

      <footer
        style={{ backgroundColor: "oklch(0.33 0.065 196)" }}
        className="mt-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-accent" />
            <span className="text-white/80 font-semibold text-sm">
              HabitTracker
            </span>
          </div>
          <p className="text-white/50 text-xs flex items-center gap-1">
            © {new Date().getFullYear()} Built with{" "}
            <Heart className="w-3 h-3 text-teal-accent fill-teal-accent" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4 text-white/50 text-xs">
            <span>Home</span>
            <span>Support</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
