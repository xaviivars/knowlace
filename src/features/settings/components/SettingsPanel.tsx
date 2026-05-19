"use client"

import { useState, useEffect } from "react"
import {
  UserCircleIcon,
  PaintBrushIcon,
  EyeIcon,
  PresentationChartBarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import { ProfileImageUpload } from "@/features/settings/components/ProfileImageUpload"
import { updateProfileAction } from "@/features/settings/settings-actions"

type SettingsSection =
  | "profile"
  | "usage"
  | "appearance"
  | "accessibility"
  | "presentation"
  | "account"

type SettingsPanelProps = {
  user: {
    name: string
    email: string
    image: string | null
  }
  aiUsage: AiUsageSummary
}

type AiUsageSummary = {
  periodType: string
  periodStart: string
  periodEnd: string
  usedTokens: number
  remainingTokens: number
  maxTokens: number
  requests: number
}

const settingsSections: {
  id: SettingsSection
  label: string
  description: string
  icon: React.ElementType
}[] = [
  {
    id: "profile",
    label: "Perfil público",
    description: "Nombre y datos visibles de tu cuenta.",
    icon: UserCircleIcon,
  },
  {
    id: "usage",
    label: "Uso",
    description: "Consulta tu consumo de IA y tokens disponibles.",
    icon: ChartBarIcon,
  },
  {
    id: "appearance",
    label: "Apariencia",
    description: "Tema visual de la aplicación.",
    icon: PaintBrushIcon,
  },
  {
    id: "accessibility",
    label: "Accesibilidad",
    description: "Opciones para mejorar la lectura y navegación.",
    icon: EyeIcon,
  },
  {
    id: "presentation",
    label: "Presentación",
    description: "Preferencias para las sesiones en directo.",
    icon: PresentationChartBarIcon,
  },
  {
    id: "account",
    label: "Cuenta",
    description: "Seguridad y acciones de cuenta.",
    icon: ShieldCheckIcon,
  },
]

export function SettingsPanel({ user, aiUsage }: SettingsPanelProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile")

  const currentSection = settingsSections.find(
    (section) => section.id === activeSection
  )

  return (
    <div className="h-full mt-4 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
      <main className="ml-10 mr-auto flex w-full max-w-376 flex-col gap-14 px-10 py-9 text-white">
        <section>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
            Configuración
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Ajustes
          </h1>

          <p className="mt-3 max-w-3xl text-lg text-white/60">
            Gestiona tus preferencias de cuenta, apariencia y experiencia de presentación.
          </p>
        </section>

        <section className="grid min-h-0 gap-14 pt-2 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="space-y-2.5 border-r border-white/10 pr-7">
            {settingsSections.map((section) => (
              <SettingsNavItem
                key={section.id}
                section={section}
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </aside>

          <section className="min-h-0 w-full max-w-6xl space-y-9 pb-10">
            <div className="border-b border-white/10 pb-7">
              <h2 className="text-4xl font-bold">
                {currentSection?.label}
              </h2>

              <p className="mt-2 max-w-3xl text-base text-white/55">
                {currentSection?.description}
              </p>
            </div>

            {activeSection === "profile" && (
              <ProfileSettings user={user} />
            )}

            {activeSection === "usage" && (
              <UsageSettings usage={aiUsage} />
            )}

            {activeSection === "appearance" && (
              <AppearanceSettings />
            )}

            {activeSection === "accessibility" && (
              <AccessibilitySettings />
            )}

            {activeSection === "presentation" && (
              <PresentationSettings />
            )}

            {activeSection === "account" && (
              <AccountSettings />
            )}
          </section>
        </section>
      </main>
    </div>
  )
}

function SettingsNavItem({
  section,
  active,
  onClick,
}: {
  section: {
    label: string
    description: string
    icon: React.ElementType
  }
  active: boolean
  onClick: () => void
}) {
  const Icon = section.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full cursor-pointer items-center gap-4 rounded-2xl px-5 py-4 text-left text-[1.05rem] font-medium transition
        ${
          active
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      <Icon
        className={`
          h-7 w-7 shrink-0
          ${active ? "text-blue-300" : "text-white/40"}
        `}
      />

      <span>
        {section.label}
      </span>
    </button>
  )
}

function ProfileSettings({
  user,
}: {
  user: {
    name: string
    email: string
    image: string | null
  }
}) {
  return (
    <div className="space-y-8">

      <SettingsField
        label="Foto de perfil"
        description="Esta imagen aparecerá en tu panel y en la barra lateral."
        contentClassName="max-w-xl justify-self-end"
      >
        <ProfileImageUpload
          user={{
            name: user.name,
            image: user.image,
          }}
        />
      </SettingsField>
      
      <form action={updateProfileAction} className="space-y-8">
        <SettingsField
          label="Nombre visible"
          description="Este nombre se utilizará dentro del panel del profesor."
          contentClassName="max-w-xl justify-self-end"
        >
          <input
            name="name"
            defaultValue={user.name}
            required
            maxLength={80}
            className="h-11 w-full rounded-xl border border-white/10 bg-black/15 px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/60 focus:bg-white/10"
          />
        </SettingsField>

        <SettingsField
          label="Correo electrónico"
          description="Correo asociado a tu cuenta."
          contentClassName="max-w-xl justify-self-end"
        >
          <input
            value={user.email}
            disabled
            className="h-11 w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 text-base text-white/50 outline-none"
          />
        </SettingsField>

        <div className="flex justify-end">
          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}

function AppearanceSettings() {
  return (
    <div className="space-y-8">
      <SettingsField
        label="Tema"
        description="Elige cómo quieres visualizar la aplicación."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <ChoiceCard title="Oscuro" description="Actual" active />
          <ChoiceCard title="Claro" description="Interfaz clara" />
          <ChoiceCard title="Sistema" description="Según el dispositivo" />
        </div>
      </SettingsField>

      <SettingsField
        label="Color principal"
        description="Personaliza el color de acento de la interfaz."
      >
        <div className="flex flex-wrap gap-3">
          <ColorDot color="bg-blue-500" active />
          <ColorDot color="bg-indigo-500" />
          <ColorDot color="bg-cyan-500" />
          <ColorDot color="bg-emerald-500" />
          <ColorDot color="bg-violet-500" />
        </div>
      </SettingsField>
    </div>
  )
}

function AccessibilitySettings() {
  return (
    <div className="space-y-4">
      <SettingsToggle
        title="Reducir animaciones"
        description="Minimiza transiciones y efectos visuales."
      />

      <SettingsToggle
        title="Mayor contraste"
        description="Aumenta el contraste de textos, bordes y botones."
      />

      <SettingsToggle
        title="Texto más grande"
        description="Mejora la legibilidad en pantallas grandes o proyectores."
      />
    </div>
  )
}

function PresentationSettings() {
  return (
    <div className="space-y-4">
      <SettingsToggle
        title="Abrir presentaciones con toolbar visible"
        description="Muestra siempre la barra superior de navegación y zoom."
        defaultChecked
      />

      <SettingsToggle
        title="Resetear zoom al entrar en pantalla completa"
        description="Vuelve al 100% al activar o salir del modo pantalla completa."
        defaultChecked
      />

      <SettingsToggle
        title="Permitir navegación local del alumno"
        description="El alumno podrá moverse por las diapositivas disponibles."
        defaultChecked
      />
    </div>
  )
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <div className="max-w-5xl rounded-2xl border border-white/10 bg-black/15 p-5">
        <h3 className="text-lg font-semibold text-white">
          Sesión actual
        </h3>

        <p className="mt-2 text-base text-white/55">
          Puedes cerrar sesión desde la barra lateral del dashboard.
        </p>
      </div>

      <div className="max-w-5xl rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <h3 className="text-lg font-semibold text-red-200">
          Zona peligrosa
        </h3>

        <p className="mt-2 text-base text-red-100/70">
          Estas acciones pueden afectar permanentemente a tu cuenta y a tus sesiones.
        </p>

        <button
          type="button"
          disabled
          className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 opacity-60"
        >
          Eliminar cuenta
        </button>
      </div>
    </div>
  )
}

function SettingsField({
  label,
  description,
  children,
  contentClassName = "max-w-4xl",
}: {
  label: string
  description: string
  children: React.ReactNode
  contentClassName?: string
}) {
  return (
    <div className="grid gap-6 border-b border-white/10 pb-8 md:grid-cols-[320px_minmax(0,1fr)]">
      <div>
        <h3 className="text-lg font-semibold text-white">
          {label}
        </h3>

        <p className="mt-1 text-base leading-relaxed text-white/45">
          {description}
        </p>
      </div>

      <div className={`w-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  )
}

function ChoiceCard({
  title,
  description,
  active = false,
}: {
  title: string
  description: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={`
        cursor-pointer rounded-2xl border p-5 text-left transition
        ${
          active
            ? "border-blue-400/40 bg-blue-500/10"
            : "border-white/10 bg-black/15 hover:bg-white/10"
        }
      `}
    >
      <p className="text-lg font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-base text-white/45">
        {description}
      </p>
    </button>
  )
}

function ColorDot({
  color,
  active = false,
}: {
  color: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={`
        flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition
        ${active ? "border-white" : "border-white/10 hover:border-white/40"}
      `}
    >
      <span className={`h-7 w-7 rounded-full ${color}`} />
    </button>
  )
}

function SettingsToggle({
  title,
  description,
  defaultChecked = false,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex max-w-5xl cursor-pointer items-center justify-between gap-6 rounded-2xl border border-white/10 bg-black/15 p-5 transition hover:bg-white/5">
      <div>
        <p className="text-lg font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-base text-white/45">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-5 cursor-pointer accent-blue-500"
      />
    </label>
  )
}

function UsageSettings({
  usage,
}: {
  usage: AiUsageSummary
}) {
  const usedPercentage =
    usage.maxTokens > 0
      ? Math.min((usage.usedTokens / usage.maxTokens) * 100, 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="max-w-5xl rounded-3xl border border-white/10 bg-[#142544]/80 p-6 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
              Uso de IA
            </p>

            <h3 className="mt-2 text-3xl font-bold text-white">
              Tokens disponibles
            </h3>

            <p className="mt-2 max-w-2xl text-white/55">
              Este contador limita el uso de generación con IA para evitar consumo excesivo.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-blue-200/70">
              Reinicio
            </p>

            <AiUsageCountdown periodEnd={usage.periodEnd} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <UsageMetric
            label="Usados"
            value={formatTokens(usage.usedTokens)}
          />

          <UsageMetric
            label="Restantes"
            value={formatTokens(usage.remainingTokens)}
          />

          <UsageMetric
            label="Solicitudes"
            value={String(usage.requests)}
          />
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-white/55">
              Consumo actual
            </span>

            <span className="font-medium text-white/75">
              {formatTokens(usage.usedTokens)} / {formatTokens(usage.maxTokens)}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-400 transition-all"
              style={{
                width: `${usedPercentage}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm text-white/40">
            El límite actual se reinicia automáticamente al finalizar la ventana de uso.
          </p>
        </div>
      </div>
    </div>
  )
}

function UsageMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-5">
      <p className="text-sm text-white/45">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function AiUsageCountdown({
  periodEnd,
}: {
  periodEnd: string
}) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(periodEnd))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(periodEnd))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [periodEnd])

  return (
    <p className="mt-1 font-mono text-lg font-bold text-blue-100">
      {timeLeft}
    </p>
  )
}

function getTimeLeft(periodEnd: string) {
  const diff = Math.max(new Date(periodEnd).getTime() - Date.now(), 0)

  const hours = Math.floor(diff / 1000 / 60 / 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function formatTokens(value: number) {
  return new Intl.NumberFormat("es-ES").format(value)
}