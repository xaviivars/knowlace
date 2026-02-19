"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm"

export default async function Register () {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="relative w-full max-w-md">
        <RegisterForm/>
      </div>
    </>
  )

}