import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Habit } from "../backend";
import { useActor } from "./useActor";

export function useHabits() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHabitStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["habitStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabitStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCheckIns() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allCheckIns"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCheckIns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCheckInHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      date,
    }: { habitId: bigint; date: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.checkInHabit(habitId, date);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allCheckIns"] });
      qc.invalidateQueries({ queryKey: ["habitStats"] });
    },
  });
}

export function useAddHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (habit: Habit) => {
      if (!actor) throw new Error("No actor");
      return actor.addHabit(habit);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["habitStats"] });
    },
  });
}

export function useEditHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      habit,
    }: { habitId: bigint; habit: Habit }) => {
      if (!actor) throw new Error("No actor");
      return actor.editHabit(habitId, habit);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (habitId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteHabit(habitId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["habitStats"] });
      qc.invalidateQueries({ queryKey: ["allCheckIns"] });
    },
  });
}

export function useAddDefaultHabits() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.addDefaultHabits();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["habitStats"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
