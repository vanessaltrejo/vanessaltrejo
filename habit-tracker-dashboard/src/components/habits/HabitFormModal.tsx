import React, { useState, useEffect } from 'react';
import { X, Sparkles, Target, Palette, Check, FileSpreadsheet } from 'lucide-react';
import { Habit, HabitCategory, HabitFrequencyType } from '../../types/habit';
import { useHabits } from '../../context/HabitContext';

interface HabitFormModalProps {
  isOpen: boolean;
  habitToEdit?: Habit | null;
  onClose: () => void;
}

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#6366F1', // Indigo
];

const ICON_PRESETS = [
  { name: 'PenLine', label: 'Journal' },
  { name: 'Dumbbell', label: 'Exercise' },
  { name: 'Moon', label: 'Sleep' },
  { name: 'Sparkles', label: 'Meditate' },
  { name: 'BookOpen', label: 'Reading' },
  { name: 'Code2', label: 'Code' },
  { name: 'Droplets', label: 'Water' },
  { name: 'Heart', label: 'Health' },
  { name: 'Zap', label: 'Energy' },
  { name: 'Coffee', label: 'Routine' },
  { name: 'Target', label: 'Focus' },
  { name: 'Sun', label: 'Morning' },
  { name: 'Activity', label: 'Metric' },
];

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  habitToEdit,
  onClose,
}) => {
  const { addHabit, updateHabit } = useHabits();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('productivity');
  const [frequencyType, setFrequencyType] = useState<HabitFrequencyType>('daily');
  const [targetValue, setTargetValue] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>('');
  const [color, setColor] = useState('#3B82F6');
  const [iconName, setIconName] = useState('Code2');
  const [sheetColumnName, setSheetColumnName] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category);
      setFrequencyType(habitToEdit.frequency.type);
      setTargetValue(habitToEdit.targetValue ? String(habitToEdit.targetValue) : '');
      setTargetUnit(habitToEdit.targetUnit || '');
      setColor(habitToEdit.color);
      setIconName(habitToEdit.iconName);
      setSheetColumnName(habitToEdit.sheetColumnName || habitToEdit.name);
    } else {
      setName('');
      setDescription('');
      setCategory('productivity');
      setFrequencyType('daily');
      setTargetValue('60');
      setTargetUnit('mins');
      setColor('#3B82F6');
      setIconName('Code2');
      setSheetColumnName('');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedTargetVal = targetValue.trim() ? parseFloat(targetValue) : undefined;

    if (habitToEdit) {
      await updateHabit({
        ...habitToEdit,
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        frequency: { type: frequencyType },
        targetValue: parsedTargetVal,
        targetUnit: targetUnit.trim() || undefined,
        color,
        iconName,
        sheetColumnName: sheetColumnName.trim() || name.trim(),
      });
    } else {
      await addHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        frequency: { type: frequencyType },
        targetValue: parsedTargetVal,
        targetUnit: targetUnit.trim() || undefined,
        color,
        iconName,
        sheetColumnName: sheetColumnName.trim() || name.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2a26]/40 backdrop-blur-xs overflow-y-auto">
      <div
        id="habit-form-modal-dialog"
        className="w-full max-w-lg bg-white rounded-[28px] shadow-xl border border-[#f2ede8] overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#f2ede8] bg-[#f8f5f2]/50">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: color }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#3d3d2e]">
                {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
              </h3>
              <p className="text-xs text-[#8a847c]">
                Configure frequency, targets, and Google Sheets mapping
              </p>
            </div>
          </div>
          <button
            id="close-habit-form-btn"
            onClick={onClose}
            className="text-[#a39d94] hover:text-[#3d3d2e] p-1.5 rounded-full hover:bg-[#f2ede8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Habit Name */}
          <div>
            <label className="block text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-1.5">
              Habit Name <span className="text-[#a35540]">*</span>
            </label>
            <input
              type="text"
              id="habit-name-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deep Code & Architecture, Read 20 Pages, Drink 2L..."
              className="w-full px-4 py-2.5 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-full focus:outline-none focus:ring-1 focus:ring-[#5a5a40] focus:bg-white transition-all font-medium text-[#3d3d2e]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-1.5">
              Description / Intent
            </label>
            <input
              type="text"
              id="habit-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Stay focused without phone notifications for 1 hour..."
              className="w-full px-4 py-2.5 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-full focus:outline-none focus:ring-1 focus:ring-[#5a5a40] focus:bg-white transition-all text-[#3d3d2e]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              id="habit-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
              className="w-full px-4 py-2.5 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-full focus:outline-none focus:ring-1 focus:ring-[#5a5a40] text-[#3d3d2e] capitalize cursor-pointer"
            >
              <option value="productivity">Productivity</option>
              <option value="learning">Learning</option>
              <option value="health">Health</option>
              <option value="fitness">Fitness</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="finance">Finance</option>
              <option value="creativity">Creativity</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          {/* Frequency & Target Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                id="habit-frequency-select"
                value={frequencyType}
                onChange={(e) => setFrequencyType(e.target.value as HabitFrequencyType)}
                className="w-full px-4 py-2.5 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-full focus:outline-none focus:ring-1 focus:ring-[#5a5a40] text-[#3d3d2e] capitalize cursor-pointer"
              >
                <option value="daily">Every Day</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-1.5">
                Target Value
              </label>
              <input
                type="number"
                id="habit-target-val-input"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="60, 20, 2..."
                className="w-full px-4 py-2.5 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-full focus:outline-none focus:ring-1 focus:ring-[#5a5a40] focus:bg-white text-[#3d3d2e]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-1.5">
                Target Unit
              </label>
              <input
                type="text"
                id="habit-target-unit-input"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder="mins, ml, pages..."
                className="w-full px-4 py-2.5 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-full focus:outline-none focus:ring-1 focus:ring-[#5a5a40] focus:bg-white text-[#3d3d2e]"
              />
            </div>
          </div>

          {/* Color & Icon Pickers */}
          <div>
            <label className="block text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    color === c ? 'ring-2 ring-offset-2 ring-[#5a5a40] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-2">
              Habit Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_PRESETS.map((ic) => (
                <button
                  type="button"
                  key={ic.name}
                  onClick={() => setIconName(ic.name)}
                  className={`p-2 rounded-2xl text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                    iconName === ic.name
                      ? 'bg-[#f2ede8] text-[#5a5a40] border-[#5a5a40]/30 shadow-2xs font-semibold'
                      : 'bg-[#f8f5f2] text-[#8a847c] border-[#e9e4df] hover:bg-[#f2ede8]'
                  }`}
                >
                  <span className="text-[10px] truncate">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Google Sheets Personalization Mapping */}
          <div className="pt-3 border-t border-[#f2ede8]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider mb-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#5a5a40]" />
              <span>Google Sheets Column Customization</span>
            </div>
            <input
              type="text"
              id="habit-sheet-col-input"
              value={sheetColumnName}
              onChange={(e) => setSheetColumnName(e.target.value)}
              placeholder="e.g. Deep Coding Hours (Leave blank to use Habit Name)"
              className="w-full px-4 py-2.5 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-full focus:outline-none focus:ring-1 focus:ring-[#5a5a40] text-[#3d3d2e]"
            />
            <p className="text-[11px] text-[#8a847c] mt-1">
              Personalize the column title that will appear in your Google Spreadsheet.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f2ede8]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-[#8a847c] hover:bg-[#f2ede8] rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-habit-btn"
              className="px-6 py-2 text-xs font-bold text-white bg-[#5a5a40] hover:bg-[#484833] active:bg-[#3d3d2e] rounded-full transition-all shadow-xs cursor-pointer"
            >
              {habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
