import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { DeleteSessionButton } from "@/features/session/components/DeleteSessionButton"
import Link from "next/link"

export default async function Dashboard () {

    const session = await auth.api.getSession({
        headers: await headers(),
    })
    
    if (!session) {
        return <div className="text-white p-8">No autorizado</div>
    }

    const sessions = await prisma.teachingSession.findMany({
        where: {
            ownerId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="min-h-screen bg-[#0e1d38] text-white p-4">

            <h1 className="text-4xl font-bold mb-6">
                Bienvenido, {session.user.name}
            </h1>

            {sessions.length === 0 ? (
                <div className="bg-[#142544] border border-white/10 rounded-xl p-8 text-white/60">
                Esto está muy vacío... crea tu primera sesión 🚀
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((s) => (
                        <div
                        key={s.id}
                        className="bg-[#142544] border border-white/10 rounded-xl p-6 hover:border-blue-500 transition-all duration-200 hover:scale-[1.02]"
                        >
                        <Link
                            href={`/dashboard/sessions/${s.id}`}
                            className="block"
                        >
                            <h2 className="text-xl font-semibold mb-2">
                            {s.title}
                            </h2>

                            {s.description && (
                            <p className="text-white/60 text-sm mb-4">
                                {s.description}
                            </p>
                            )}

                            <div className="text-xs text-white/40 mb-4">
                            Código: {s.accessCode}
                            </div>
                        </Link>

                        <div className="flex justify-end">
                            <DeleteSessionButton
                            sessionId={s.id}
                            title={s.title}
                            />
                        </div>
                        </div>
                    ))}
                    </div>
            )}
        </div>
    )

}