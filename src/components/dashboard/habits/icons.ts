import {
  Activity,
  BookOpen,
  Code2,
  Coffee,
  Droplets,
  Dumbbell,
  Heart,
  Moon,
  PenLine,
  Sparkles,
  Sun,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { HabitCategory, HabitFrequencyType } from "@/lib/habits/types";

// Shared between HabitCard (renders the saved icon) and HabitFormModal
// (lets Vanessa pick one) — a single source so the two can never drift.
export const HABIT_ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Droplets,
  BookOpen,
  Dumbbell,
  Sparkles,
  Moon,
  Heart,
  Zap,
  Coffee,
  Target,
  Sun,
  Activity,
  PenLine,
};

export const HABIT_ICON_PRESETS: Array<{ name: string; label: string }> = [
  { name: "PenLine", label: "Diario" },
  { name: "Dumbbell", label: "Ejercicio" },
  { name: "Moon", label: "Sueño" },
  { name: "Sparkles", label: "Meditar" },
  { name: "BookOpen", label: "Lectura" },
  { name: "Code2", label: "Código" },
  { name: "Droplets", label: "Agua" },
  { name: "Heart", label: "Salud" },
  { name: "Zap", label: "Energía" },
  { name: "Coffee", label: "Rutina" },
  { name: "Target", label: "Enfoque" },
  { name: "Sun", label: "Mañana" },
  { name: "Activity", label: "Métrica" },
];

// The site's own gold accent plus a small complementary spread, replacing
// the reference app's generic Tailwind swatch set.
export const HABIT_COLOR_PRESETS: string[] = [
  "#ffd60a",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
];

export const HABIT_CATEGORY_LABELS: Record<HabitCategory, string> = {
  productivity: "Productividad",
  learning: "Aprendizaje",
  health: "Salud",
  fitness: "Fitness",
  mindfulness: "Mindfulness",
  finance: "Finanzas",
  creativity: "Creatividad",
  personal: "Personal",
};

export const HABIT_FREQUENCY_LABELS: Record<HabitFrequencyType, string> = {
  daily: "Todos los días",
  weekdays: "Días laborales",
  weekends: "Fines de semana",
  weekly_target: "Meta semanal",
};
