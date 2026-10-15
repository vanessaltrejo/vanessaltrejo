/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Habit } from './types/habit';
import { AuthProvider } from './context/AuthContext';
import { HabitProvider, useHabits } from './context/HabitContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { HabitList } from './components/habits/HabitList';
import { HabitFormModal } from './components/habits/HabitFormModal';
import { HabitDetailModal } from './components/habits/HabitDetailModal';
import { ConfirmationModal } from './components/layout/ConfirmationModal';
import { LinkGoogleSheetModal } from './components/sheets/LinkGoogleSheetModal';

const MainDashboard: React.FC = () => {
  const { deleteHabit } = useHabits();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isLinkSheetModalOpen, setIsLinkSheetModalOpen] = useState<boolean>(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [habitForDetails, setHabitForDetails] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const handleOpenNewHabit = () => {
    setHabitToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsFormModalOpen(true);
  };

  const handleOpenDetails = (habit: Habit) => {
    setHabitForDetails(habit);
  };

  const handleDeleteRequest = (habit: Habit) => {
    setHabitToDelete(habit);
  };

  const handleConfirmDelete = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col lg:flex-row antialiased text-[#2d2a26]">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenLinkSheetModal={() => setIsLinkSheetModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenNewHabitModal={handleOpenNewHabit}
          onOpenLinkSheetModal={() => setIsLinkSheetModalOpen(true)}
        />

        {/* Dynamic View Body (Single Page Layout) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-6">
          <HabitList
            onOpenDetails={handleOpenDetails}
            onOpenEdit={handleOpenEditHabit}
            onDeleteRequest={handleDeleteRequest}
            onOpenNewHabitModal={handleOpenNewHabit}
          />
        </main>
      </div>

      {/* Create / Edit Habit Modal */}
      <HabitFormModal
        isOpen={isFormModalOpen}
        habitToEdit={habitToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setHabitToEdit(null);
        }}
      />

      {/* Habit Details & Heatmap Modal */}
      <HabitDetailModal
        habit={habitForDetails}
        onClose={() => setHabitForDetails(null)}
        onOpenEdit={handleOpenEditHabit}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Link Google Sheet Modal */}
      <LinkGoogleSheetModal
        isOpen={isLinkSheetModalOpen}
        onClose={() => setIsLinkSheetModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!habitToDelete}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.name}"? All associated check-in records for this habit will be removed.`}
        confirmLabel="Delete Habit"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <MainDashboard />
      </HabitProvider>
    </AuthProvider>
  );
}
