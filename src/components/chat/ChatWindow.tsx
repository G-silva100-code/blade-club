'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MessageInput } from './MessageInput'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import type { Message, Profile } from '@/types'

interface ChatWindowProps {
  bookingId: string
  currentUserId: string
  participants: Record<string, Pick<Profile, 'full_name' | 'avatar_url'>>
}

export function ChatWindow({ bookingId, currentUserId, participants }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))

    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId
          const sender = participants[msg.sender_id]
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <Avatar src={sender?.avatar_url} name={sender?.full_name} size="sm" />
              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.blocked ? (
                  <div className="flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Mensagem bloqueada pela plataforma
                  </div>
                ) : (
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${isOwn ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {msg.content}
                  </div>
                )}
                <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <MessageInput bookingId={bookingId} senderId={currentUserId} />
    </div>
  )
}
