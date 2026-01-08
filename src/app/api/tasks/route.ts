import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: [
      { completed: 'asc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json(tasks)
}


export async function POST(req: Request) {
  const { title, dueDate } = await req.json()

  const task = await prisma.task.create({
    data: {
      title,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })

  return NextResponse.json(task)
}



export async function PATCH(req: Request) {
  const { id, completed } = await req.json()
  const task = await prisma.task.update({
    where: { id },
    data: { completed },
  })
  return NextResponse.json(task)
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
