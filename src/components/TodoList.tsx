import type { ComponentProps } from 'react'
import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'

type Props = Omit<ComponentProps<typeof TodoItem>, 'todo'> & { todos: Todo[]; emptyMessage: string }

export function TodoList({ todos, emptyMessage, ...actions }: Props) {
  if (!todos.length) return <div className="empty-state"><span aria-hidden="true">✓</span><p>{emptyMessage}</p></div>
  return <ul className="todo-list" aria-label="Tasks">{todos.map(todo => <TodoItem key={todo.id} todo={todo} {...actions} />)}</ul>
}
