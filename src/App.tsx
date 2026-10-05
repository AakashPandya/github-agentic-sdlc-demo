import { useState } from 'react'
import { TodoForm } from './components/TodoForm'
import { TodoFilters } from './components/TodoFilters'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import type { TodoFilter } from './types/todo'
import './styles.css'

export default function App() {
  const { todos, addTodo, editTodo, deleteTodo, toggleTodo, clearCompleted, storageError } = useTodos()
  const [filter, setFilter] = useState<TodoFilter>('all')
  const remaining = todos.filter(todo => !todo.completed).length
  const completed = todos.length - remaining
  const visible = todos.filter(todo => filter === 'all' || (filter === 'completed' ? todo.completed : !todo.completed))
  const emptyMessage = filter === 'completed' ? 'Finished tasks will appear here.' : filter === 'active' && todos.length ? 'All caught up. Enjoy the space.' : 'A clear list. A fresh start. Add your first task above.'

  return (
    <div className="app-shell">
      <header className="brand"><span className="brand-mark" aria-hidden="true">✓</span> tasklight <span className="edition">THE EVERYDAY LIST</span></header>
      <main>
        <div className="intro"><p className="eyebrow">A LITTLE FOCUS GOES A LONG WAY</p><h1>Make room for<br /><span>what matters.</span></h1><p>One place for your next steps. One thing at a time.</p></div>
        <section className="task-card" aria-label="Your to-do list">
          <TodoForm onAdd={addTodo} />
          <div className="list-toolbar"><TodoFilters value={filter} onChange={setFilter} /><span className="task-total">{todos.length} total</span></div>
          <TodoList todos={visible} emptyMessage={emptyMessage} onEdit={editTodo} onDelete={deleteTodo} onToggle={toggleTodo} />
          <footer className="list-footer"><span role="status"><strong>{remaining}</strong> {remaining === 1 ? 'task' : 'tasks'} remaining</span><button type="button" disabled={!completed} onClick={clearCompleted}>Clear completed{completed ? ` (${completed})` : ''}</button></footer>
        </section>
        <p className={`storage-note ${storageError ? 'error' : ''}`} role={storageError ? 'alert' : undefined}>{storageError ?? 'Saved in this browser · Ready when you come back'}</p>
      </main>
      <footer className="page-footer"><span>Small steps. Meaningful progress.</span><span>To-Do App CI/CD with gh-aw Agents</span></footer>
    </div>
  )
}
