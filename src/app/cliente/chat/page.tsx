import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardBody } from '@/components/ui/Card'
import { MessageSquare } from 'lucide-react'

export default async function ChatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
      <Card>
        <CardBody className="text-center py-10 text-gray-400">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">O chat abre automaticamente quando você tiver um agendamento confirmado.</p>
        </CardBody>
      </Card>
    </div>
  )
}
