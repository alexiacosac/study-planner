'use client'
import { useEffect, useState } from 'react'

type Task = {
  id: string
  title: string
  completed: boolean
  dueDate?: string | null
}

function daysUntil(date: string) {
  const today = new Date()
  const due = new Date(date)

  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  return Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')

  const load = async () => {
    const r = await fetch('/api/tasks')
    setTasks(await r.json())
  }

  useEffect(() => {
    load()
  }, [])

  const add = async () => {
    if (!title.trim()) return

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        dueDate: dueDate || null,
      }),
    })

    setTitle('')
    setDueDate('')
    load()
  }

  const toggle = async (t: Task) => {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: t.id,
        completed: !t.completed,
      }),
    })
    load()
  }

  const remove = async (id: string) => {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <main className="mx-auto max-w-xl p-10">
      <h1 className="mb-6 text-3xl font-bold">📚 Study Planner</h1>

      {/* ADD TASK */}
      <div className="mb-6 flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="New task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded border px-3 py-2"
        />
        <button
          className="rounded bg-black px-4 py-2 text-white"
          onClick={add}
        >
          Add
        </button>
      </div>

      {/* TASK LIST */}
      <ul className="space-y-2">
        {tasks.map(t => {
          const daysLeft = t.dueDate ? daysUntil(t.dueDate) : null

          const label =
            daysLeft === null
              ? null
              : daysLeft < 0
              ? 'Overdue'
              : daysLeft === 0
              ? 'Today'
              : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`

          return (
            <li
              key={t.id}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggle(t)}
                className="mt-1 h-5 w-5 accent-black"
              />

              <div className="flex-1">
                <div
                  className={
                    t.completed
                      ? 'line-through text-zinc-400'
                      : 'text-zinc-800'
                  }
                >
                  {t.title}
                </div>

                {t.dueDate && (
                  <div
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium
                      ${
                        daysLeft! < 0
                          ? 'bg-red-100 text-red-700'
                          : daysLeft === 0
                          ? 'bg-orange-100 text-orange-700'
                          : daysLeft! <= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                  >
                    {new Date(t.dueDate).toLocaleDateString()} • {label}
                  </div>
                )}
              </div>

              <button
                onClick={() => remove(t.id)}
                className="text-sm text-zinc-400 hover:text-red-500"
              >
                Delete
              </button>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
