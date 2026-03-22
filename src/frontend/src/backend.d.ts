import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HabitStatsWithId {
    habitId: bigint;
    longestStreak: bigint;
    totalCheckIns: bigint;
    currentStreak: bigint;
}
export interface HabitCheckIn {
    date: string;
    habitId: bigint;
}
export interface Habit {
    id: bigint;
    name: string;
    description: string;
    emoji: string;
    category: HabitCategory;
}
export interface HabitStatsWithHabit {
    habit: Habit;
    longestStreak: bigint;
    totalCheckIns: bigint;
    currentStreak: bigint;
}
export interface UserProfile {
    name: string;
}
export enum HabitCategory {
    productivity = "productivity",
    mindfulness = "mindfulness",
    wellness = "wellness",
    health = "health"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDefaultHabits(): Promise<void>;
    addHabit(habit: Habit): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkInHabit(habitId: bigint, date: string): Promise<void>;
    checkInHabitForAllDays(habitId: bigint, dates: Array<string>): Promise<void>;
    deleteHabit(habitId: bigint): Promise<void>;
    editHabit(habitId: bigint, updatedHabit: Habit): Promise<void>;
    getAllCheckIns(): Promise<Array<HabitCheckIn>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckInsByHabit(habitId: bigint): Promise<Array<string>>;
    getCurrentStreaks(): Promise<Array<HabitStatsWithId>>;
    getHabitById(habitId: bigint): Promise<Habit | null>;
    getHabitStats(): Promise<Array<HabitStatsWithHabit>>;
    getHabits(): Promise<Array<Habit>>;
    getPopularHabits(): Promise<Array<Habit>>;
    getTrendingHabits(): Promise<Array<Habit>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
