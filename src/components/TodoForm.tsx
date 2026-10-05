import { useState } from 'react'
import type { FormEvent } from 'react'

export function TodoForm({ onAdd }: { onAdd: (title: string) => boolean }) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (onAdd(title)) {
      setTitle('')
      setError(false)
    } else setError(true)
  }

  return (
    <form onSubmit={submit} className="add-form">
      <label htmlFor="new-task">What needs to get done?</label>
      <div className="input-row">
        <input id="new-task" value={title} onChange={event => setTitle(event.target.value)}
          placeholder="Give your next step a name…" maxLength={500}
          aria-invalid={error} aria-describedby={error ? 'add-error' : undefined} />
        <button className="primary" type="submit"><span aria-hidden="true">＋</span> Add task</button>
      </div>
      {error && <p id="add-error" className="error" role="alert">Enter a task title with at least one non-space character.</p>}
    </form>
  )
}
