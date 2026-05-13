import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DeleteSessionButton } from "@/features/session/components/DeleteSessionButton";
import Link from "next/link";
import { AppBackground } from "@/components/ui/AppBackground";

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

          <section className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Tus sesiones</h2>
              <p className="mt-1 text-sm text-white/50">
                {sessions.length === 0
                  ? "Todavía no has creado ninguna sesión."
                  : `${sessions.length} sesión${sessions.length === 1 ? "" : "es"} creada${sessions.length === 1 ? "" : "s"}.`}
              </p>
            </div>
          </section>

          {sessions.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-white/15 bg-[#142544] p-10 text-center shadow-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-3xl">
                🚀
              </div>

              <h3 className="text-2xl font-bold">Crea tu primera sesión</h3>

              <p className="mx-auto mt-3 max-w-xl text-white/60">
                Sube un PDF, configura la sesión y empieza a generar preguntas
                para tus alumnos.
              </p>

              <Link
                href="/dashboard/sessions/new"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 active:scale-[0.98]"
              >
                Crear sesión
              </Link>
            </section>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sessions.map((s) => (
                <article
                  key={s.id}
                  className="group flex min-h-55 flex-col justify-between rounded-3xl border border-white/10 bg-[#142544] p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-blue-950/40"
                >
                  <Link
                    href={`/dashboard/sessions/${s.id}`}
                    className="block flex-1"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="line-clamp-2 text-xl font-bold text-white group-hover:text-blue-200">
                          {s.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm text-white/55">
                          {s.description || "Sin descripción."}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          s.isActive
                            ? "bg-green-500/15 text-green-300"
                            : "bg-zinc-500/15 text-zinc-300"
                        }`}
                      >
                        {s.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm">
                      <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                        <p className="text-xs uppercase tracking-wide text-white/35">
                          Código de acceso
                        </p>
                        <p className="mt-1 font-mono text-lg font-semibold tracking-widest text-blue-200">
                          {s.accessCode}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>
                          {s.pdfPages} página{s.pdfPages === 1 ? "" : "s"}
                        </span>
                        <span>
                          {new Date(s.createdAt).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <Link
                      href={`/dashboard/sessions/${s.id}/edit`}
                      className="text-sm font-medium text-blue-300 transition hover:text-blue-200 hover:underline"
                    >
                      Editar preguntas
                    </Link>

                    <DeleteSessionButton sessionId={s.id} title={s.title} />
                  </div>
                </article>
              ))}
            </section>
          )}
          </div>
        </main>
    </AppBackground>
  );
}
