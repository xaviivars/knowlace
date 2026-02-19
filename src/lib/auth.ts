import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";
import { nextCookies } from "better-auth/next-js"; 

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, });
const prisma = new PrismaClient({ adapter })

export const auth = betterAuth ({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: "",
            clientSecret: "",
        }
    },
    plugins: [nextCookies()]
})

console.log("DATABASE_URL:", process.env.DATABASE_URL)
