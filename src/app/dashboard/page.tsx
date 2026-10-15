import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { HabitsApp } from "@/components/dashboard/habits/HabitsApp";

// The personal dashboard shown after Google sign-in — the habit tracker
// ported from habit-tracker-dashboard/ (see that folder's own README),
// restyled to the portfolio's dark/gold/Instrument Serif look. Session
// gating only, on purpose: any Google account can sign in and use the
// dashboard for now (see the chat thread this was built from) — nothing
// here should be treated as protecting anything more sensitive than that
// until an allowlist is explicitly asked for.
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <HabitsApp
      siteUser={{ name: session.user.name, image: session.user.image }}
      signOutSlot={
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            Cerrar sesión
          </button>
        </form>
      }
    />
  );
}
