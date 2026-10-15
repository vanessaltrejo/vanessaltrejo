"use client";

import { type ReactNode, useState } from "react";
import type { Habit } from "@/lib/habits/types";
import { SheetsAuthProvider } from "@/lib/habits/SheetsAuthContext";
import { HabitProvider, useHabits } from "@/lib/habits/HabitsContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { HabitList } from "./HabitList";
import { HabitFormModal } from "./HabitFormModal";
import { HabitDetailModal } from "./HabitDetailModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { LinkGoogleSheetModal } from "./LinkGoogleSheetModal";

interface HabitsAppProps {
  siteUser: { name: string | null | undefined; image: string | null | undefined };
  signOutSlot: ReactNode;
}

function MainDashboard({ siteUser, signOutSlot }: HabitsAppProps) {
  const { deleteHabit } = useHabits();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLinkSheetModalOpen, setIsLinkSheetModalOpen] = useState(false);
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
  const handleConfirmDelete = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#1a1d29] text-white antialiased lg:flex-row">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenLinkSheetModal={() => setIsLinkSheetModalOpen(true)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenNewHabitModal={handleOpenNewHabit}
          onOpenLinkSheetModal={() => setIsLinkSheetModalOpen(true)}
          siteUser={siteUser}
          signOutSlot={signOutSlot}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6 lg:p-10">
          <HabitList
            onOpenDetails={setHabitForDetails}
            onOpenEdit={handleOpenEditHabit}
            onDeleteRequest={setHabitToDelete}
            onOpenNewHabitModal={handleOpenNewHabit}
          />
        </main>
      </div>

      <HabitFormModal
        isOpen={isFormModalOpen}
        habitToEdit={habitToEdit}
        onClose={() => { setIsFormModalOpen(false); setHabitToEdit(null); }}
      />

      <HabitDetailModal
        habit={habitForDetails}
        onClose={() => setHabitForDetails(null)}
        onOpenEdit={handleOpenEditHabit}
        onDeleteRequest={setHabitToDelete}
      />

      <LinkGoogleSheetModal isOpen={isLinkSheetModalOpen} onClose={() => setIsLinkSheetModalOpen(false)} />

      <ConfirmationModal
        isOpen={!!habitToDelete}
        title="Eliminar hábito"
        message={`¿Seguro que quieres eliminar "${habitToDelete?.name}"? Se borrarán todos sus registros.`}
        confirmLabel="Eliminar hábito"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
}

// Entry point rendered by src/app/dashboard/page.tsx — self-contained
// providers so nothing outside this tree (the site's own GSAP scroll
// machinery, cursor, language context) can reach in or clash with it.
export function HabitsApp(props: HabitsAppProps) {
  return (
    <SheetsAuthProvider>
      <HabitProvider>
        <MainDashboard {...props} />
      </HabitProvider>
    </SheetsAuthProvider>
  );
}
