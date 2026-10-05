import type { TodoFilter } from '../types/todo'

export function TodoFilters({ value, onChange }: { value: TodoFilter; onChange: (filter: TodoFilter) => void }) {
  return (
    <div className="filters" role="group" aria-label="Filter tasks">
      {(['all', 'active', 'completed'] as const).map(filter => (
        <button type="button" key={filter} aria-pressed={value === filter} onClick={() => onChange(filter)}>
          {filter[0].toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  )
}
