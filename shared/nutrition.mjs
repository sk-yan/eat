export const macroFactors = {
  egg: { protein: 0.13, fat: 0.095, carbs: 0.011 },
  milk: { protein: 0.03, fat: 0.032, carbs: 0.046 },
  yogurt: { protein: 0.05, fat: 0.033, carbs: 0.035 },
  blueberry: { protein: 0.007, fat: 0.003, carbs: 0.13 },
  whey: { protein: 0.8, fat: 0.06, carbs: 0.08 },
  breast: { protein: 0.225, fat: 0.026, carbs: 0 },
  leg: { protein: 0.26, fat: 0.06, carbs: 0 },
  shank: { protein: 0.29, fat: 0.05, carbs: 0 },
  rib: { protein: 0.2, fat: 0.12, carbs: 0 },
  steak: { protein: 0.21, fat: 0.1, carbs: 0 },
  shrimp: { protein: 0.2, fat: 0.005, carbs: 0.002 },
  salmon: { protein: 0.2, fat: 0.13, carbs: 0 },
  rice: { protein: 0.026, fat: 0.009, carbs: 0.23 },
  sweet: { protein: 0.016, fat: 0.001, carbs: 0.2 },
  potato: { protein: 0.02, fat: 0.001, carbs: 0.175 },
  choy: { protein: 0.015, fat: 0.002, carbs: 0.017 },
  carrot: { protein: 0.009, fat: 0.002, carbs: 0.09 },
  mushroom: { protein: 0.03, fat: 0.003, carbs: 0.027 },
  spinach: { protein: 0.025, fat: 0.004, carbs: 0.025 },
  onion: { protein: 0.011, fat: 0.001, carbs: 0.085 },
  baby: { protein: 0.011, fat: 0.002, carbs: 0.027 },
  broccoli: { protein: 0.028, fat: 0.004, carbs: 0.04 },
  asparagus: { protein: 0.022, fat: 0.001, carbs: 0.03 },
  oil: { protein: 0, fat: 1, carbs: 0 },
};

export const lowCarbPlan = {
  deficit: 600,
  proteinPerKg: 2,
  fatRatio: 0.35,
  minimumCarbs: 60,
};

export const activityLevels = [
  { id: "office", label: "久坐办公 / 学习", multiplier: 1.2 },
  { id: "mobile", label: "日常走动较多", multiplier: 1.35 },
  { id: "physical", label: "体力活动较多", multiplier: 1.5 },
];

export const intensityLevels = [
  {
    id: "easy",
    label: "偏轻",
    strengthMet: 3.5,
    cardioMet: 4.5,
  },
  {
    id: "moderate",
    label: "中等",
    strengthMet: 5,
    cardioMet: 6,
  },
  {
    id: "hard",
    label: "偏高",
    strengthMet: 6,
    cardioMet: 8,
  },
];

export function emptyMacros() {
  return { protein: 0, fat: 0, carbs: 0, calories: 0 };
}

export function addMacros(...items) {
  const result = emptyMacros();
  for (const item of items) {
    result.protein += item.protein;
    result.fat += item.fat;
    result.carbs += item.carbs;
  }
  result.calories = result.protein * 4 + result.fat * 9 + result.carbs * 4;
  return result;
}

export function foodMacros(id, grams) {
  const factor = macroFactors[id];
  if (!factor) return emptyMacros();
  return addMacros({
    protein: factor.protein * grams,
    fat: factor.fat * grams,
    carbs: factor.carbs * grams,
  });
}

export function mealMacros(plate) {
  const parts = [
    plate.meat,
    ...(plate.extraProtein ? [plate.extraProtein] : []),
    ...plate.vegetables,
    ...(plate.starch ? [plate.starch] : []),
  ].map((item) => foodMacros(item.id, item.grams));
  parts.push(foodMacros("rice", plate.rice));
  parts.push(foodMacros("oil", plate.oil || 0));
  return addMacros(...parts);
}

export function breakfastMacros(day) {
  const eggs = foodMacros("egg", 100);
  return day.breakfast === "milk"
    ? addMacros(eggs, foodMacros("milk", 250))
    : addMacros(eggs, foodMacros("yogurt", 135), foodMacros("blueberry", 150));
}

export function snackMacros(day) {
  const parts =
    day.breakfast === "milk"
      ? [foodMacros("yogurt", 135), foodMacros("blueberry", 150)]
      : [foodMacros("milk", 250)];
  if (day.extraYogurt) parts.push(foodMacros("yogurt", 135));
  return addMacros(...parts);
}

export function boostMacros(boost) {
  return addMacros(...boost.map((item) => foodMacros(item.id, item.grams)));
}

export function dayMacros(day, boost) {
  return addMacros(
    breakfastMacros(day),
    snackMacros(day),
    boostMacros(boost),
    mealMacros(day.lunch),
    mealMacros(day.dinner),
  );
}

export function averageMacros(days, boost) {
  const total = addMacros(...days.map((day) => dayMacros(day, boost)));
  return {
    protein: total.protein / days.length,
    fat: total.fat / days.length,
    carbs: total.carbs / days.length,
    calories: total.calories / days.length,
  };
}

export function roundMacros(macros) {
  return {
    protein: Math.round(macros.protein),
    fat: Math.round(macros.fat),
    carbs: Math.round(macros.carbs),
    calories: Math.round(macros.calories),
  };
}

export function bmrMifflin({ sex, age, height, weight }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export function energyTargets(profile) {
  const activity =
    activityLevels.find((item) => item.id === profile.activity) ||
    activityLevels[0];
  const intensity =
    intensityLevels.find((item) => item.id === profile.intensity) ||
    intensityLevels[1];
  const bmr = bmrMifflin(profile);
  const baseDaily = bmr * activity.multiplier;
  const strengthHours = profile.strengthMinutes / 60;
  const cardioHours = profile.cardioMinutes / 60;
  const sessionExercise =
    Math.max(0, intensity.strengthMet - 1) * profile.weight * strengthHours +
    Math.max(0, intensity.cardioMet - 1) * profile.weight * cardioHours;
  const averageExercise = (sessionExercise * profile.sessions) / 7;
  const tdee = baseDaily + averageExercise;
  const calorieFloor = Math.max(bmr, profile.sex === "male" ? 1500 : 1200);
  const intake = Math.min(
    tdee,
    Math.max(calorieFloor, tdee - lowCarbPlan.deficit),
  );
  const protein = lowCarbPlan.proteinPerKg * profile.weight;
  const fat = (intake * lowCarbPlan.fatRatio) / 9;
  const remainingCarbs = (intake - protein * 4 - fat * 9) / 4;
  const carbs = Math.max(lowCarbPlan.minimumCarbs, remainingCarbs);
  const deficit = Math.max(0, tdee - intake);
  const targetLoss = Number.isFinite(profile.targetWeight)
    ? Math.max(0, profile.weight - profile.targetWeight)
    : 0;
  return {
    bmr,
    baseDaily,
    sessionExercise,
    averageExercise,
    restDayExpenditure: baseDaily,
    trainingDayExpenditure: baseDaily + sessionExercise,
    tdee,
    intake,
    deficit,
    weeklyLoss: (deficit * 7) / 7700,
    estimatedWeeks:
      targetLoss > 0 && deficit > 0
        ? (targetLoss * 7700) / (deficit * 7)
        : null,
    macros: {
      protein,
      fat,
      carbs,
      calories: protein * 4 + fat * 9 + carbs * 4,
    },
  };
}
