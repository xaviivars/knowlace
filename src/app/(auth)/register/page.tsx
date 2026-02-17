"use client"

import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/auth/RegisterForm"

export default function Register () {
  const router = useRouter()

  return (
    <>
      <button onClick={() => router.push("/")} className="fixed top-6 left-6 text-white hover:text-blue-400 transition">
        ← Volver
      </button>

      <div className="relative w-full max-w-md">
        <RegisterForm/>
      </div>
    </>
  )

}