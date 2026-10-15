"use client";

import { useState, type FormEvent } from "react";
import { X, Sparkles, Check, FileSpreadsheet } from "lucide-react";
import type { Habit, HabitCategory, HabitFrequencyType } from "@/lib/habits/types";
import { useHabits } from "@/lib/habits/HabitsContext";
import { SYSTEM_FONT_STACK, DISPLAY_SERIF_STYLE } from "@/lib/fonts";
import { HABIT_CATEGORY_LABELS, HABIT_COLOR_PRESETS, HABIT_FREQUENCY_LABELS, HABIT_ICON_PRESETS } from "./icons";

interface HabitFormModalProps {
  isOpen: boolean;
  habitToEdit?: Habit | null;
  onClose: () => void;
}

const FIELD_CLASSNAME =
  "w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 transition-all focus:border-[#ffd60a]/50 focus:bg-white/10 focus:outline-none";
const FIELD_LABEL_CLASSNAME = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/40";

export function HabitFormModal({ isOpen, habitToEdit, onClose }: HabitFormModalProps) {
  const { addHabit, updateHabit } = useHabits();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<HabitCategory>("productivity");
  const [frequencyType, setFrequencyType] = useState<HabitFrequencyType>("daily");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [color, setColor] = useState(HABIT_COLOR_PRESETS[0]);
  const [iconName, setIconName] = useState("Target");
  const [sheetColumnName, setSheetColumnName] = useState("");

  // Re-seeds the fields whenever a *different* open/edit-target combo shows
  // up, without an effect — comparing against the previous render's key and
  // adjusting state right here is React's own recommended alternative to
  // "reset state when a prop changes" (see the docs on storing information
  // from previous renders), and it's what keeps this in sync whether the
  // modal opens fresh for a new habit or reopens targeting a different one.
  const formKey = isOpen ? (habitToEdit?.id ?? "__new__") : "__closed__";
  const [lastFormKey, setLastFormKey] = useState(formKey);
  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description ?? "");
      setCategory(habitToEdit.category);
      setFrequencyType(habitToEdit.frequency.type);
      setTargetValue(habitToEdit.targetValue ? String(habitToEdit.targetValue) : "");
      setTargetUnit(habitToEdit.targetUnit ?? "");
      setColor(habitToEdit.color);
      setIconName(habitToEdit.iconName);
      setSheetColumnName(habitToEdit.sheetColumnName ?? habitToEdit.name);
    } else {
      setName("");
      setDescription("");
      setCategory("productivity");
      setFrequencyType("daily");
      setTargetValue("");
      setTargetUnit("");
      setColor(HABIT_COLOR_PRESETS[0]);
      setIconName("Target");
      setSheetColumnName("");
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedTargetVal = targetValue.trim() ? parseFloat(targetValue) : undefined;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      frequency: { type: frequencyType },
      targetValue: parsedTargetVal,
      targetUnit: targetUnit.trim() || undefined,
      color,
      iconName,
      sheetColumnName: sheetColumnName.trim() || name.trim(),
    };

    if (habitToEdit) {
      await updateHabit({ ...habitToEdit, ...payload });
    } else {
      await addHabit(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-[#20222d] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: color }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base text-white" style={DISPLAY_SERIF_STYLE}>
                {habitToEdit ? "Editar hábito" : "Nuevo hábito"}
              </h3>
              <p className="text-xs text-white/40" style={{ fontFamily: SYSTEM_FONT_STACK }}>
                Configura frecuencia, meta y su columna en Sheets
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto p-6" style={{ fontFamily: SYSTEM_FONT_STACK }}>
          <div>
            <label className={FIELD_LABEL_CLASSNAME}>
              Nombre <span className="text-red-400">*</span>
            </label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Leer 20 páginas, Tomar 2L de agua…" className={FIELD_CLASSNAME} />
          </div>

          <div>
            <label className={FIELD_LABEL_CLASSNAME}>Descripción</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ej. Sin celular durante la sesión…" className={FIELD_CLASSNAME} />
          </div>

          <div>
            <label className={FIELD_LABEL_CLASSNAME}>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as HabitCategory)} className={`${FIELD_CLASSNAME} cursor-pointer [&>option]:bg-[#20222d]`}>
              {(Object.keys(HABIT_CATEGORY_LABELS) as HabitCategory[]).map((key) => (
                <option key={key} value={key}>{HABIT_CATEGORY_LABELS[key]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={FIELD_LABEL_CLASSNAME}>Frecuencia</label>
              <select value={frequencyType} onChange={(e) => setFrequencyType(e.target.value as HabitFrequencyType)} className={`${FIELD_CLASSNAME} cursor-pointer [&>option]:bg-[#20222d]`}>
                <option value="daily">{HABIT_FREQUENCY_LABELS.daily}</option>
                <option value="weekdays">{HABIT_FREQUENCY_LABELS.weekdays}</option>
                <option value="weekends">{HABIT_FREQUENCY_LABELS.weekends}</option>
              </select>
            </div>
            <div>
              <label className={FIELD_LABEL_CLASSNAME}>Meta</label>
              <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="30, 20, 2…" className={FIELD_CLASSNAME} />
            </div>
            <div>
              <label className={FIELD_LABEL_CLASSNAME}>Unidad</label>
              <input value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)} placeholder="min, páginas…" className={FIELD_CLASSNAME} />
            </div>
          </div>

          <div>
            <label className={FIELD_LABEL_CLASSNAME}>Color</label>
            <div className="flex flex-wrap items-center gap-2">
              {HABIT_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform ${color === c ? "scale-110 ring-2 ring-white/60 ring-offset-2 ring-offset-[#20222d]" : "hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="h-3.5 w-3.5 stroke-[3] text-[#171410]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={FIELD_LABEL_CLASSNAME}>Ícono</label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {HABIT_ICON_PRESETS.map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setIconName(ic.name)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-xs font-medium transition-all ${
                    iconName === ic.name ? "border-[#ffd60a]/40 bg-[#ffd60a]/10 font-semibold text-[#ffd60a]" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  <span className="truncate text-[10px]">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ffd60a]">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Columna en Google Sheets</span>
            </div>
            <input
              value={sheetColumnName}
              onChange={(e) => setSheetColumnName(e.target.value)}
              placeholder="Deja vacío para usar el nombre del hábito"
              className={FIELD_CLASSNAME}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-xs font-semibold text-white/50 transition-colors hover:bg-white/10 hover:text-white">
              Cancelar
            </button>
            <button type="submit" className="rounded-full bg-[#ffd60a] px-6 py-2 text-xs font-bold text-[#171410] transition-transform hover:scale-105">
              {habitToEdit ? "Guardar cambios" : "Crear hábito"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
