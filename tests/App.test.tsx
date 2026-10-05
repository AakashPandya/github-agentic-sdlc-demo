import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

async function addTask(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.type(screen.getByLabelText('What needs to get done?'), title)
  await user.click(screen.getByRole('button', { name: 'Add task' }))
}

describe('task list', () => {
  it('creates, edits, completes, filters, clears and deletes tasks', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Prepare demo')
    await addTask(user, 'Review checklist')
    expect(screen.getByRole('status')).toHaveTextContent('2 tasks remaining')
    await user.click(screen.getByRole('button', { name: 'Edit Prepare demo' }))
    const input = screen.getByRole('textbox', { name: 'Edit task title' })
    await user.clear(input)
    await user.type(input, 'Prepare customer demo')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await user.click(screen.getByRole('checkbox', { name: 'Mark Prepare customer demo complete' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 task remaining')
    await user.click(screen.getByRole('button', { name: 'Active' }))
    expect(screen.queryByText('Prepare customer demo')).not.toBeInTheDocument()
    expect(screen.getByText('Review checklist')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getByText('Prepare customer demo')).toBeVisible()
    expect(screen.queryByText('Review checklist')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear completed (1)' }))
    expect(screen.getByText('Finished tasks will appear here.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'All' }))
    await user.click(screen.getByRole('button', { name: 'Delete Review checklist' }))
    expect(screen.getByRole('status')).toHaveTextContent('0 tasks remaining')
  })

  it('preserves titles and completion when remounted', async () => {
    const user = userEvent.setup()
    const view = render(<App />)
    await addTask(user, 'Saved task')
    await user.click(screen.getByRole('checkbox', { name: 'Mark Saved task complete' }))
    view.unmount()
    render(<App />)
    expect(screen.getByRole('checkbox', { name: 'Mark Saved task incomplete' })).toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: 'Mark Saved task incomplete' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 task remaining')
  })

  it('cancels edits without changing the task', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Original title')
    await user.click(screen.getByRole('button', { name: 'Edit Original title' }))
    await user.type(screen.getByRole('textbox', { name: 'Edit task title' }), ' changed')
    await user.keyboard('{Escape}')
    expect(within(screen.getByRole('list', { name: 'Tasks' })).getByText('Original title')).toBeVisible()
  })
})
