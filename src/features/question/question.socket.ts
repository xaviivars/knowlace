import { Server, Socket } from "socket.io"
import { prisma } from "@/lib/prisma"
import { getLeaderboardByAccessCode } from "@/features/session/session-service"

export function registerQuestionSockets(io: Server, socket: Socket) {

  socket.on("answer-submitted", async () => {

    try {

        const accessCode = socket.data.accessCode

        if (!accessCode) return
        if (socket.data.role !== "participant") return

        const session = await prisma.teachingSession.findUnique({
            where: { accessCode },
        })

        if (!session) return

        const activeQuestion = await prisma.question.findFirst({
            where: {
                sessionId: session.id,
                status: "ACTIVE",
            },
        })

        if (!activeQuestion) return

        const now = new Date()

        if (activeQuestion.endedAt && activeQuestion.endedAt < now) {
            return
        }

        const leaderboard = await getLeaderboardByAccessCode(accessCode)

        if (leaderboard) {
            io.to(accessCode).emit("leaderboard-updated", leaderboard)
        }

        io.to(accessCode).emit("question-stats-updated", {
            questionId: activeQuestion.id
        })

    } catch (error) {
        console.error("answer-submitted failed", error)
    }

    })

    socket.on("launch-question", async () => {

        try {

            const accessCode = socket.data.accessCode

            if (!accessCode) return
            if (socket.data.role !== "owner") return

            const session = await prisma.teachingSession.findUnique({
                where: { accessCode },
            })

            if (!session) return

            const slide = await prisma.slide.findFirst({
                where: {
                    sessionId: session.id,
                    order: session.currentPage,
                },
                include: {
                    question: true,
                },
            })

        const question = slide?.question

        if (!question) return
        if (question.status !== "IDLE") return

        io.to(accessCode).emit("question-countdown", {
            seconds: 3,
        })

        await prisma.question.update({
            where: { id: question.id },
            data: { status: "COUNTDOWN" }
        })

        const COUNTDOWN = 3000

        setTimeout(async () => {

            try {

                const updatedSession = await prisma.teachingSession.findUnique({
                    where: { accessCode },
                })

                if (!updatedSession) return
                if (updatedSession.currentPage !== slide.order) return

                const now = new Date()
                const timeLimit = question.timeLimit ?? 30
                const endedAt = new Date(now.getTime() + timeLimit * 1000)

                await prisma.question.update({
                    where: { id: question.id },
                    data: {
                        status: "ACTIVE",
                        startedAt: now,
                        endedAt,
                    },
                })

                io.to(accessCode).emit("question-started", {
                    questionId: question.id,
                    timeLimit,
                    startedAt: now,
                })

                setTimeout(async () => {

                    try {

                        await prisma.question.update({
                            where: { id: question.id },
                            data: { status: "RESULTS", },
                        })

                    io.to(accessCode).emit("question-ended")

                    io.to(accessCode).emit("question-stats-updated", {
                        questionId: question.id,
                    })

                    } catch (error) {
                        console.error("launch-question results timeout failed", error)
                    }

                }, timeLimit * 1000)
            } catch (error) {
                console.error("launch-question countdown timeout failed", error)
            }
        }, COUNTDOWN)
        } catch (error) {
            console.error("launch-question failed", error)
        }
    })

    socket.on("end-question", async () => {

        try {

            const accessCode = socket.data.accessCode

            if (!accessCode) return
            if (socket.data.role !== "owner") return

            const session = await prisma.teachingSession.findUnique({
                where: { accessCode },
            })

            if (!session) return

            const activeQuestion = await prisma.question.findFirst({
                where: {
                    sessionId: session.id,
                    status: "ACTIVE",
                },
            })

            if (!activeQuestion) return

            const now = new Date()

            await prisma.question.update({
                where: { id: activeQuestion.id },
                data: {
                    status: "RESULTS",
                    endedAt: now,
                },
            })

            io.to(accessCode).emit("question-ended")
            io.to(accessCode).emit("question-stats-updated", {
                questionId: activeQuestion.id,
            })

        } catch (error) {
            console.error("end-question failed", error)
        }
    })

    socket.on("request-question-state", async ({ accessCode, slideIndex }) => {

        try {

            if (!accessCode || typeof slideIndex !== "number") return

            const session = await prisma.teachingSession.findUnique({
                where: { accessCode }
            })

            if (!session) return

            const slide = await prisma.slide.findFirst({
            where: {
                sessionId: session.id,
                order: slideIndex,
            },
            include: {
                question: true,
            },
            })

            if (!slide || !slide.question) return
            const question = slide.question

            if (question.status === "RESULTS") {
                socket.emit("question-stats-updated", {
                    questionId: question.id,
                })
            }

            } catch (error) {
                console.error("request-question-state failed", error)
            }   
    })

    socket.on("relaunch-question", async () => {

        try {

            const accessCode = socket.data.accessCode

            if (!accessCode) return
            if (socket.data.role !== "owner") return

            const session = await prisma.teachingSession.findUnique({
                where: { accessCode }
            })

            if (!session) return

            const slide = await prisma.slide.findFirst({
                where: {
                sessionId: session.id,
                order: session.currentPage,
                },
                include: {
                question: true,
                },
            })

            const question = slide?.question

            if (!question) return

            await prisma.answer.deleteMany({
                where: { questionId: question.id }
            })

            await prisma.question.update({
                where: { id: question.id },
                data: {
                    status: "IDLE",
                    startedAt: null,
                    endedAt: null
                }
            })

            io.to(accessCode).emit("question-reset")
        } catch (error) {
            console.error("relaunch-question failed", error)
        }
        })

    }