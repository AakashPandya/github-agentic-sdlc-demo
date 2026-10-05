import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Todo } from '../types/todo'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, title: string) => boolean
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [error, setError] = useState(false)

  function save(event: FormEvent) {
    event.preventDefault()
    if (onEdit(todo.id, draft)) setEditing(false)
    else setError(true)
  }

  return (
    <li className={`todo-item ${todo.completed ? 'is-complete' : ''}`}>
      {editing ? (
        <form onSubmit={save} className="edit-form">
          <label className="sr-only" htmlFor={`edit-${todo.id}`}>Edit task title</label>
          <input id={`edit-${todo.id}`} value={draft} autoFocus maxLength={500}
            aria-invalid={error} aria-describedby={error ? `error-${todo.id}` : undefined}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => { if (event.key === 'Escape') setEditing(false) }} />
          <button className="primary" type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          {error && <p id={`error-${todo.id}`} className="error" role="alert">Task title cannot be blank.</p>}
        </form>
      ) : (
        <>
          <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)}
            aria-label={`Mark ${todo.title} ${todo.completed ? 'incomplete' : 'complete'}`} />
          <span className="todo-title">{todo.title}</span>
          <div className="item-actions">
            <button type="button" aria-label={`Edit ${todo.title}`} onClick={() => {
              setDraft(todo.title); setError(false); setEditing(true)
            }}>Edit</button>
            <button type="button" className="delete" aria-label={`Delete ${todo.title}`} onClick={() => onDelete(todo.id)}>Delete</button>
          </div>
        </>
      )}
    </li>
  )
}
