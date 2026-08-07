import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Strips heavy base64 attachment data before persisting to localStorage —
// only keeps small metadata so history stays lightweight across reloads.
// The image/file itself is only available in-memory for the current tab
// session; after a refresh, past attachments show as a plain label.
function stripAttachmentData(messages) {
  return messages.map((m) => ({
    ...m,
    attachments: (m.attachments || []).map(({ data, ...meta }) => meta),
  }))
}

export const useAssistantStore = create(
  persist(
    (set) => ({
      apiKey: '',
      model: 'gemini-2.5-flash',
      includeContext: true,
      messages: [], // { id, role: 'user'|'assistant', text, attachments?, createdAt }
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setIncludeContext: (includeContext) => set({ includeContext }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'meridian_assistant',
      partialize: (state) => ({ ...state, messages: stripAttachmentData(state.messages) }),
    }
  )
)
