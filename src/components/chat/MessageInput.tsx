'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isMessageBlocked } from '@/lib/utils'

interface MessageInputProps {
  bookingId: string
  senderId: string
}

export function MessageInput({ bookingId, senderId }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  async function handleSend() {
    const text = content.trim()
    if (!text || sending) return

    const blocked = isMessageBlocked(text)
    setSending(true)

    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: senderId,
      content: text,
      blocked,
    })

    if (blocked) {
      await supabase.from('bypass_flags').insert({
        booking_id: bookingId,
        reason: `Mensagem bloqueada: "${text.slice(0, 80)}"`,
      })
    }

    setContent('')
    setSending(false)
  }

  return (
    <div className="border-t border-gray-100 p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400 text-center">
        Compartilhar telefone ou contato externo é proibido pela plataforma
      </p>
    </div>
  )
}
