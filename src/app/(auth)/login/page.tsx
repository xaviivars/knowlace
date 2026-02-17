"use client"

import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/LoginForm"

export default function Login() {
  const router = useRouter()

  return (
    <>
      <button onClick={() => router.push("/")} className="fixed top-6 left-6 text-white hover:text-blue-400 transition">
        ← Volver
      </button>

      <div className="relative w-full max-w-md">
        <LoginForm />
      </div>
    </>
  )
}