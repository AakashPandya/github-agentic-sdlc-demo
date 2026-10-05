import { useEffect, useState } from 'react'
import type { Todo } from '../types/todo'
import { loadTodos, saveTodos } from '../utils/storage'

export function useTodos() {
  const [initial] = useState(loadTodos)
  const [todos, setTodos] = useState<Todo[]>(initial.todos)
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    if (initial.error) return
    // Storage is external state; report a failed write instead of claiming durability.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!saveTodos(todos))
  }, [todos, initial.error])

  function addTodo(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return false
    const todo = { id: crypto.randomUUID(), title: trimmed, completed: false }
    setTodos(current => [...current, todo])
    return true
  }

  function editTodo(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return false
    setTodos(current => current.map(todo => todo.id === id ? { ...todo, title: trimmed } : todo))
    return true
  }

  function deleteTodo(id: string) {
    setTodos(current => current.filter(todo => todo.id !== id))
  }

  function toggleTodo(id: string) {
    setTodos(current => current.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo))
  }

  function clearCompleted() {
    setTodos(current => current.filter(todo => !todo.completed))
  }

  return {
    todos, addTodo, editTodo, deleteTodo, toggleTodo, clearCompleted,
    storageError: initial.error ?? (saveFailed ? 'Your changes are available in this session, but could not be saved to this browser.' : null),
  }
}
