import { create } from 'zustand'

// Global "quick capture" state used by the floating FAB (AppLayout) so a
// task/note/event can be captured from any page in one keystroke.
export const CAPTURE_TYPES = [
  { value: 'task', label: 'Task', placeholder: 'What needs doing?', icon: 'check' },
  { value: 'note', label: 'Note', placeholder: 'Write a quick note…', icon: 'sticky' },
  { value: 'event', label: 'Event', placeholder: 'What is happening?', icon: 'calendar' },
]

export const useCaptureStore = create((set) => ({
  open: false,
  type: 'task',
  openCapture: (type = 'task') => set({ open: true, type }),
  setType: (type) => set({ type }),
  close: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
}))