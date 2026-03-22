import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type HabitCategory = {
    #health;
    #wellness;
    #productivity;
    #mindfulness;
  };

  type Habit = {
    id : Nat;
    name : Text;
    emoji : Text;
    category : HabitCategory;
    description : Text;
  };

  type HabitStats = {
    currentStreak : Nat;
    longestStreak : Nat;
    totalCheckIns : Nat;
  };

  type HabitStatsWithHabit = {
    habit : Habit;
    currentStreak : Nat;
    longestStreak : Nat;
    totalCheckIns : Nat;
  };

  type HabitStatsWithId = {
    habitId : Nat;
    currentStreak : Nat;
    longestStreak : Nat;
    totalCheckIns : Nat;
  };

  type HabitCheckIn = {
    habitId : Nat;
    date : Text;
  };

  module HabitCheckIn {
    public func compare(h1 : HabitCheckIn, h2 : HabitCheckIn) : Order.Order {
      switch (Nat.compare(h1.habitId, h2.habitId)) {
        case (#equal) { Text.compare(h1.date, h2.date) };
        case (order) { order };
      };
    };
  };

  type UserHabits = {
    habits : Map.Map<Nat, Habit>;
    checkIns : Set.Set<HabitCheckIn>;
    nextHabitId : Nat;
  };

  type UserProfile = {
    name : Text;
  };

  let userHabitsStore = Map.empty<Principal, UserHabits>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func getUserHabitsInternal(user : Principal) : UserHabits {
    userHabitsStore.get(user).unwrap();
  };

  func getOrInitializeUserHabits(user : Principal) : UserHabits {
    switch (userHabitsStore.get(user)) {
      case (null) {
        let newUserHabits : UserHabits = {
          habits = Map.empty<Nat, Habit>();
          checkIns = Set.empty<HabitCheckIn>();
          nextHabitId = 1;
        };
        userHabitsStore.add(user, newUserHabits);
        newUserHabits;
      };
      case (?userHabits) { userHabits };
    };
  };

  func getNextHabitId(user : Principal) : Nat {
    let userHabits = getUserHabitsInternal(user);
    userHabits.nextHabitId + 1;
  };

  func updateUserHabits(user : Principal, updatedHabits : UserHabits) {
    userHabitsStore.add(user, updatedHabits);
  };

  func daysBetween(date1 : Text, date2 : Text) : Int {
    0;
  };

  // Calculate streaks for a habit
  func calculateHabitStats(user : Principal, habitId : Nat) : HabitStats {
    let userHabits = getUserHabitsInternal(user);
    let checkIns = userHabits.checkIns.toArray().filter(func(ci) { ci.habitId == habitId });

    if (checkIns.isEmpty()) {
      return {
        currentStreak = 0;
        longestStreak = 0;
        totalCheckIns = 0;
      };
    };

    var longestStreak = 0;
    var currentStreak = 0;
    var maxStreak = 0;
    var lastDate : ?Text = null;
    var totalCheckIns = 0;

    for (checkIn in checkIns.values()) {
      totalCheckIns += 1;

      switch (lastDate) {
        case (null) {
          currentStreak := 1;
        };
        case (?last) {
          let daysDiff = daysBetween(last, checkIn.date);
          if (daysDiff == 1) {
            currentStreak += 1;
          } else if (daysDiff > 1) {
            currentStreak := 1;
          };
        };
      };
      if (currentStreak > maxStreak) {
        maxStreak := currentStreak;
      };
      lastDate := ?checkIn.date;
    };

    longestStreak := maxStreak;

    {
      currentStreak;
      longestStreak;
      totalCheckIns;
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Habit Management Functions
  public shared ({ caller }) func addHabit(habit : Habit) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create habits");
    };
    let userHabits = getOrInitializeUserHabits(caller);
    let habitId = userHabits.nextHabitId;

    let newHabit : Habit = {
      habit with
      id = habitId;
    };

    // Add new habit and update nextHabitId
    userHabits.habits.add(habitId, newHabit);
    let updatedHabits : UserHabits = {
      habits = userHabits.habits;
      checkIns = userHabits.checkIns;
      nextHabitId = habitId + 1;
    };
    userHabitsStore.add(caller, updatedHabits);
    habitId;
  };

  public query ({ caller }) func getHabits() : async [Habit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view habits");
    };
    switch (userHabitsStore.get(caller)) {
      case (null) { [] };
      case (?userHabits) {
        userHabits.habits.values().toArray();
      };
    };
  };

  public shared ({ caller }) func editHabit(habitId : Nat, updatedHabit : Habit) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit habits");
    };
    let userHabits = getUserHabitsInternal(caller);
    if (not (userHabits.habits.containsKey(habitId))) {
      Runtime.trap("Habit does not exist");
    };
    let newHabit : Habit = {
      updatedHabit with
      id = habitId;
    };

    userHabits.habits.add(habitId, newHabit);
  };

  public shared ({ caller }) func deleteHabit(habitId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete habits");
    };
    let userHabits = getUserHabitsInternal(caller);
    if (not (userHabits.habits.containsKey(habitId))) {
      Runtime.trap("Habit does not exist");
    };
    userHabits.habits.remove(habitId);
    let updatedCheckIns = userHabits.checkIns.filter(
      func(ci) { Nat.compare(ci.habitId, habitId) != #equal }
    );
    let updatedHabits : UserHabits = {
      habits = userHabits.habits;
      checkIns = updatedCheckIns;
      nextHabitId = userHabits.nextHabitId;
    };
    userHabitsStore.add(caller, updatedHabits);
  };

  public shared ({ caller }) func checkInHabit(habitId : Nat, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check in habits");
    };

    switch (userHabitsStore.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?userHabits) {
        if (not (userHabits.habits.containsKey(habitId))) {
          Runtime.trap("Habit does not exist");
        };

        let checkIn : HabitCheckIn = {
          habitId;
          date;
        };
        userHabits.checkIns.add(checkIn);
      };
    };
  };

  public query ({ caller }) func getCheckInsByHabit(habitId : Nat) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view habit check-ins");
    };
    switch (userHabitsStore.get(caller)) {
      case (null) { [] };
      case (?userHabits) {
        let filteredCheckIns = List.empty<Text>();
        for (checkIn in userHabits.checkIns.values()) {
          if (Nat.compare(checkIn.habitId, habitId) == #equal) {
            filteredCheckIns.add(checkIn.date);
          };
        };
        filteredCheckIns.toArray();
      };
    };
  };

  public query ({ caller }) func getHabitStats() : async [HabitStatsWithHabit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view habit stats");
    };
    switch (userHabitsStore.get(caller)) {
      case (null) { [] };
      case (?userHabits) {
        userHabits.habits.values().toArray().map(
          func(habit) {
            let stats = calculateHabitStats(caller, habit.id);
            {
              habit;
              currentStreak = stats.currentStreak;
              longestStreak = stats.longestStreak;
              totalCheckIns = stats.totalCheckIns;
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getAllCheckIns() : async [HabitCheckIn] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view check-ins");
    };
    switch (userHabitsStore.get(caller)) {
      case (null) { [] };
      case (?userHabits) { userHabits.checkIns.toArray().sort() };
    };
  };

  public shared ({ caller }) func addDefaultHabits() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add default habits");
    };

    let userHabits = getOrInitializeUserHabits(caller);

    if (userHabits.habits.isEmpty()) {
      let habitId1 = userHabits.nextHabitId;
      let habit1 : Habit = {
        id = habitId1;
        name = "Morning Walk";
        emoji = "🚶‍♂️";
        category = #health;
        description = "Go for a 30-minute walk every morning";
      };
      userHabits.habits.add(habitId1, habit1);

      let habitId2 = habitId1 + 1;
      let habit2 : Habit = {
        id = habitId2;
        name = "Drink Water";
        emoji = "💧";
        category = #wellness;
        description = "Drink 8 glasses of water daily";
      };
      userHabits.habits.add(habitId2, habit2);

      let habitId3 = habitId2 + 1;
      let habit3 : Habit = {
        id = habitId3;
        name = "Read Book";
        emoji = "📚";
        category = #mindfulness;
        description = "Read for 20 minutes";
      };
      userHabits.habits.add(habitId3, habit3);

      let updatedHabits : UserHabits = {
        habits = userHabits.habits;
        checkIns = userHabits.checkIns;
        nextHabitId = habitId3 + 1;
      };
      userHabitsStore.add(caller, updatedHabits);
    };
  };

  public query ({ caller }) func getCurrentStreaks() : async [HabitStatsWithId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view streaks");
    };
    switch (userHabitsStore.get(caller)) {
      case (null) { [] };
      case (?userHabits) {
        userHabits.habits.values().toArray().map(
          func(habit) {
            let stats = calculateHabitStats(caller, habit.id);
            {
              habitId = habit.id;
              currentStreak = stats.currentStreak;
              longestStreak = stats.longestStreak;
              totalCheckIns = stats.totalCheckIns;
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getTrendingHabits() : async [Habit] {
    // Public function - no authorization required
    []; // Placeholder
  };

  public query ({ caller }) func getPopularHabits() : async [Habit] {
    // Public function - no authorization required
    []; // Placeholder
  };

  public query ({ caller }) func getHabitById(habitId : Nat) : async ?Habit {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get habits");
    };
    let userHabits = getUserHabitsInternal(caller);
    userHabits.habits.get(habitId);
  };

  public shared ({ caller }) func checkInHabitForAllDays(habitId : Nat, dates : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check in for all days");
    };
    
    switch (userHabitsStore.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?userHabits) {
        if (not (userHabits.habits.containsKey(habitId))) {
          Runtime.trap("Habit does not exist");
        };

        for (date in dates.values()) {
          let checkIn : HabitCheckIn = {
            habitId;
            date;
          };
          userHabits.checkIns.add(checkIn);
        };
      };
    };
  };
};
