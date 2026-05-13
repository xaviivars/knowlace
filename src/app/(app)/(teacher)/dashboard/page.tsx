import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DeleteSessionButton } from "@/features/session/components/DeleteSessionButton";
import Link from "next/link";
import { AppBackground } from "@/components/ui/AppBackground";
import { DashboardSessionsSection } from "@/features/session/components/teacher/DashboardSessionsSection"

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0e1d38] p-8 text-white">
        No autorizado
      </div>
    );
  }

  const sessions = await prisma.teachingSession.findMany({
    where: {
      ownerId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppBackground className="h-full overflow-hidden">
      <main className="h-full overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91)_transparent]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
          <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-[#142544]/70 p-8 shadow-2xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
                Panel del profesor
              </p>

              <h1 className="text-4xl font-bold mb-6">
                Bienvenido, {session.user.name}
              </h1>

              <p className="mt-3 max-w-2xl text-white/60">
                Gestiona tus sesiones, revisa los códigos de acceso y prepara
                preguntas interactivas para tus alumnos.
              </p>
            </div>

            <Link
              href="/dashboard/sessions/new"
              className="inline-flex items-center justify-center rounded-xl bg-blue-800 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-500 active:scale-[0.98]"
            >
              + Nueva sesión
            </Link>
          </section>

          <DashboardSessionsSection sessions={sessions} />
          
          </div>
        </main>
    </AppBackground>
  );
}
