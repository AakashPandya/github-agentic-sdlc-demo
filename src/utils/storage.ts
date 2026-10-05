import type { Todo } from '../types/todo'

export const STORAGE_KEY = 'tasklight.todos.v1'

export function loadTodos(): { todos: Todo[]; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { todos: [], error: null }
    const value: unknown = JSON.parse(raw)
    const ids = new Set<string>()
    if (!Array.isArray(value) || !value.every((item: unknown) => {
      if (typeof item !== 'object' || item === null) return false
      const todo = item as Partial<Todo>
      if (typeof todo.id !== 'string' || !todo.id || ids.has(todo.id) ||
          typeof todo.title !== 'string' || !todo.title.trim() ||
          typeof todo.completed !== 'boolean') return false
      ids.add(todo.id)
      return true
    })) throw new Error('Invalid stored task data')
    return { todos: value as Todo[], error: null }
  } catch {
    return { todos: [], error: 'Saved tasks could not be read. Changes will stay in this session to protect your existing data.' }
  }
}

export function saveTodos(todos: Todo[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    return true
  } catch {
    return false
  }
}
