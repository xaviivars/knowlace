import { Server, Socket } from "socket.io"
import { prisma } from "@/lib/prisma"
import { getLeaderboardByAccessCode, getQuestionStats } from "@/features/session/session-service"

export function registerQuestionSockets(io: Server, socket: Socket) {

  socket.on("answer-submitted", async () => {

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
        isActive: true,
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

  })

  socket.on("launch-question", async () => {

    const accessCode = socket.data.accessCode

    if (!accessCode) return
    if (socket.data.role !== "owner") return

    const session = await prisma.teachingSession.findUnique({
        where: { accessCode },
        include: { questions: true },
    })

    if (!session) return

    const question = session.questions.find(
        (q) => q.pageNumber === session.currentPage
    )

    if (!question) return
    if (question.isActive) return

    io.to(accessCode).emit("question-countdown", {
        seconds: 3,
    })

    const COUNTDOWN = 3000

    setTimeout(async () => {

        const updatedSession = await prisma.teachingSession.findUnique({
        where: { accessCode },
        })

        if (!updatedSession) return
        if (updatedSession.currentPage !== question.pageNumber) return

        const now = new Date()

        const timeLimit = question.timeLimit ?? 30

        const endedAt = new Date(
        now.getTime() + timeLimit * 1000
        )

        await prisma.question.update({
        where: { id: question.id },
        data: {
            isActive: true,
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

        await prisma.question.update({
            where: { id: question.id },
            data: { isActive: false },
        })

        io.to(accessCode).emit("question-ended")

        io.to(accessCode).emit("question-stats-updated", {
            questionId: question.id,
        })

        }, timeLimit * 1000)

    }, COUNTDOWN)

  })

  socket.on("end-question", async () => {

    const accessCode = socket.data.accessCode

    if (!accessCode) return
    if (socket.data.role !== "owner") return

    const session = await prisma.teachingSession.findUnique({
    where: { accessCode },
    include: { questions: true },
    })

    if (!session) return

    const activeQuestion = session.questions.find(
    q => q.isActive === true
    )

    if (!activeQuestion) return

    const now = new Date()

    await prisma.question.update({
    where: { id: activeQuestion.id },
    data: {
        isActive: false,
        endedAt: now,
    },
    })

    io.to(accessCode).emit("question-ended")
    io.to(accessCode).emit("question-stats-updated", {
    questionId: activeQuestion.id,
    })

  })

  socket.on("request-question-state", async ({ accessCode, pageNumber }) => {

    if (!accessCode || typeof pageNumber !== "number") return

    const session = await prisma.teachingSession.findUnique({
        where: { accessCode }
    })

    if (!session) return

    const question = await prisma.question.findFirst({
        where: {
        sessionId: session.id,
        pageNumber
        }
    })

    if (!question) return

    if (!question.isActive && question.endedAt) {

        socket.emit("question-stats-updated", {
        questionId: question.id,
        })

    }

  })

  socket.on("relaunch-question", async () => {

    const accessCode = socket.data.accessCode

    if (!accessCode) return
    if (socket.data.role !== "owner") return

    const session = await prisma.teachingSession.findUnique({
        where: { accessCode }
    })

    if (!session) return

    const question = await prisma.question.findFirst({
        where: {
        sessionId: session.id,
        pageNumber: session.currentPage
        }
    })

    if (!question) return

    await prisma.answer.deleteMany({
        where: { questionId: question.id }
    })

    await prisma.question.update({
        where: { id: question.id },
        data: {
        isActive: false,
        startedAt: null,
        endedAt: null
        }
    })

    io.to(accessCode).emit("question-reset")

  })

}