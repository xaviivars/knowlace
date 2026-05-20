"use client"

import { ArrowPathIcon } from "@heroicons/react/24/outline"

type RelaunchQuestionButtonProps = {
  onClick: () => void
}

export function RelaunchQuestionButton({
  onClick,
}: RelaunchQuestionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        inline-flex items-center gap-2
        rounded-xl
        border border-amber-300/20
        bg-linear-to-r from-amber-400/15 to-yellow-300/10
        px-5 py-2.5
        text-sm font-semibold
        text-amber-100
        shadow-lg shadow-amber-950/10
        transition
        hover:border-amber-300/35
        hover:from-amber-400/20
        hover:to-yellow-300/15
        hover:text-amber-50
        hover:shadow-amber-500/10
        active:scale-[0.98]
      "
    >
      <ArrowPathIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
      Relanzar pregunta
    </button>
  )
}