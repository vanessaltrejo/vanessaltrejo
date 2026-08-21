import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { dummyProjects } from "@/lib/dummy-projects";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {session.user.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {session.user.email}
            </p>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <SignOutButton />
        </form>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Mis proyectos
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Datos de ejemplo — se conectarán a datos reales más adelante.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {dummyProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    </div>
  );
}
