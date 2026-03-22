import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckSquare,
  Flame,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { HabitCategory } from "../backend";
import type { Habit } from "../backend";
import AddHabitModal from "../components/AddHabitModal";
import {
  useAddHabit,
  useDeleteHabit,
  useEditHabit,
  useHabitStats,
  useHabits,
} from "../hooks/useQueries";

const CAT_META: Record<string, { label: string; color: string }> = {
  [HabitCategory.health]: {
    label: "Health",
    color: "bg-rose-100 text-rose-600",
  },
  [HabitCategory.wellness]: {
    label: "Wellness",
    color: "bg-emerald-100 text-emerald-600",
  },
  [HabitCategory.productivity]: {
    label: "Productivity",
    color: "bg-amber-100 text-amber-600",
  },
  [HabitCategory.mindfulness]: {
    label: "Mindfulness",
    color: "bg-violet-100 text-violet-600",
  },
};

export default function MyHabitsPage() {
  const { data: habits, isLoading } = useHabits();
  const { data: stats } = useHabitStats();
  const addHabit = useAddHabit();
  const editHabit = useEditHabit();
  const deleteHabit = useDeleteHabit();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  const openAddModal = useCallback(() => {
    setEditTarget(null);
    setModalOpen(true);
  }, []);
  const openEditModal = useCallback((h: Habit) => {
    setEditTarget(h);
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditTarget(null);
  }, []);

  const handleSave = (habit: Habit) => {
    if (editTarget) {
      editHabit.mutate(
        { habitId: editTarget.id, habit: { ...habit, id: editTarget.id } },
        {
          onSuccess: () => {
            toast.success("Habit updated!");
            closeModal();
          },
          onError: () => toast.error("Failed to update."),
        },
      );
    } else {
      addHabit.mutate(habit, {
        onSuccess: () => {
          toast.success("Habit added!");
          closeModal();
        },
        onError: () => toast.error("Failed to add habit."),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteHabit.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Habit deleted.");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete."),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            My Habits
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {habits?.length ?? 0} habit{habits?.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button
          data-ocid="habits.add.primary_button"
          onClick={openAddModal}
          className="bg-teal-accent hover:bg-teal-accent/90 text-white font-semibold gap-2"
        >
          <Plus className="w-4 h-4" /> Add Habit
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="h-40 rounded-xl"
              data-ocid="habits.loading_state"
            />
          ))}
        </div>
      ) : habits?.length === 0 ? (
        <Card className="shadow-card">
          <CardContent
            className="py-16 text-center"
            data-ocid="habits.empty_state"
          >
            <div className="text-5xl mb-4">\uD83C\uDF31</div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No habits yet
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Start building better habits today!
            </p>
            <Button
              onClick={openAddModal}
              className="bg-teal-accent hover:bg-teal-accent/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Add your first habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence initial={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {habits?.map((habit, idx) => {
              const stat = stats?.find((s) => s.habit.id === habit.id);
              const currentStreak = Number(stat?.currentStreak ?? 0);
              const longestStreak = Number(stat?.longestStreak ?? 0);
              const totalCheckIns = Number(stat?.totalCheckIns ?? 0);
              const cat = CAT_META[habit.category] ?? {
                label: habit.category,
                color: "bg-gray-100 text-gray-600",
              };

              return (
                <motion.div
                  key={String(habit.id)}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  data-ocid={`habits.item.${idx + 1}`}
                >
                  <Card className="shadow-card hover:shadow-card-hover transition-shadow h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">
                            {habit.emoji}
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold leading-tight">
                              {habit.name}
                            </CardTitle>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${cat.color}`}
                            >
                              {cat.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            data-ocid={`habits.edit_button.${idx + 1}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(habit)}
                            className="h-8 w-8 p-0 hover:bg-secondary"
                            aria-label="Edit habit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            data-ocid={`habits.delete_button.${idx + 1}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(habit)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10"
                            aria-label="Delete habit"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {habit.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {habit.description}
                        </p>
                      )}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/60">
                          <div className="flex items-center gap-1 text-orange-500">
                            <Flame className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">
                              {currentStreak}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            streak
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/60">
                          <div className="flex items-center gap-1 text-teal-accent">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">
                              {longestStreak}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            best
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/60">
                          <div className="flex items-center gap-1 text-violet-500">
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">
                              {totalCheckIns}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            total
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <AddHabitModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        isPending={addHabit.isPending || editHabit.isPending}
        editHabit={editTarget}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="habits.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.name}&rdquo;
              and all its check-in history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="habits.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="habits.delete.confirm_button"
              onClick={handleDelete}
              disabled={deleteHabit.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
