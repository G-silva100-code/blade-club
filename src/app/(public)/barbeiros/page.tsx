import Link from 'next/link'
import { ChevronRight, CheckCircle, DollarSign, Users, Shield, Clock, Star, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Trabalhe conosco',
  description: 'Seja um parceiro Blade Club. Acesse clientes premium em Curitiba, receba 70% de cada atendimento e construa sua reputação.',
}

export default function BarbeirosPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center bg-blade-bg overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#C9A84C08,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs font-medium tracking-[0.3em] uppercase">Para barbeiros</span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-bold text-blade-text leading-[1.08] text-balance">
              Faça parte do<br />
              <span className="text-gold">Blade Club</span>
            </h1>

            <p className="mt-6 text-lg text-blade-muted leading-relaxed max-w-lg">
              Acesse uma clientela premium que você não alcançaria sozinho. Executivos, médicos e empresários de Curitiba
              que pagam acima da média — no endereço deles, na agenda deles.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/cadastro/barbeiro"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-blade-bg hover:bg-gold-light transition-colors"
              >
                Quero ser parceiro <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="#beneficios"
                className="inline-flex items-center gap-2 rounded-full border border-blade-border px-8 py-3.5 text-sm font-medium text-blade-text hover:border-gold hover:text-gold transition-colors"
              >
                Ver benefícios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-28 bg-blade-card border-t border-blade-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Por que o Blade Club</span>
              <div className="h-px w-8 bg-gold" />
            </div>
            <h2 className="font-display text-4xl font-bold text-blade-text">Você faz o que sabe. Nós trazemos o cliente.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="bg-blade-bg border border-blade-border rounded-2xl p-7 hover:border-gold transition-colors group">
                <div className="w-10 h-10 rounded-full border border-blade-border flex items-center justify-center mb-5 group-hover:border-gold transition-colors">
                  <b.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-lg font-bold text-blade-text mb-2">{b.title}</h3>
                <p className="text-blade-muted text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ganhos */}
      <section className="py-28 bg-blade-bg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Ganhos</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-blade-text mb-6">
                Você fica com 70% de cada atendimento
              </h2>
              <p className="text-blade-muted leading-relaxed mb-8">
                Nossa comissão é de 30% — em troca, você recebe clientes premium
                que não encontraria por conta própria, pagamento garantido e toda a
                infraestrutura de agendamento e cobrança resolvida.
              </p>
              <ul className="space-y-4">
                {earningPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-blade-muted text-sm">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blade-card border border-blade-border rounded-2xl p-8">
              <div className="h-px w-full bg-gold mb-8" />
              <h3 className="font-display text-lg font-semibold text-blade-text mb-6">
                Exemplo — 20 atendimentos por mês
              </h3>
              <div className="space-y-4">
                {earningsExample.map((row) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center py-3 border-b border-blade-border last:border-0 ${row.highlight ? 'border-0 mt-2' : ''}`}
                  >
                    <span className="text-blade-muted text-sm">{row.label}</span>
                    <span className={`font-semibold ${row.highlight ? 'text-gold text-2xl font-display' : 'text-blade-text'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-px w-full bg-gold mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* O que buscamos */}
      <section className="py-28 bg-blade-card border-t border-blade-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Perfil</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-4xl font-bold text-blade-text mb-4">O que buscamos</h2>
          <p className="text-blade-muted mb-12">Qualidade e confiança são inegociáveis no Blade Club</p>

          <div className="grid sm:grid-cols-3 gap-5 text-left">
            {requirements.map((r) => (
              <div key={r.title} className="bg-blade-bg border border-blade-border rounded-2xl p-6">
                <div className="h-px w-8 bg-gold mb-5" />
                <h4 className="font-display font-bold text-blade-text mb-2">{r.title}</h4>
                <p className="text-sm text-blade-muted">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-28 bg-blade-bg">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Blade Club</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-blade-text mb-6">
            Pronto para crescer?
          </h2>
          <p className="text-blade-muted mb-10 max-w-lg mx-auto">
            Cadastro gratuito. Análise em até 48h. Comece a receber clientes premium assim que aprovado.
          </p>
          <Link
            href="/cadastro/barbeiro"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-10 py-4 text-base font-semibold text-blade-bg hover:bg-gold-light transition-colors"
          >
            Cadastrar como parceiro <ChevronRight className="h-5 w-5" />
          </Link>
          <p className="mt-6 text-sm text-blade-muted">
            Já tem cadastro?{' '}
            <Link href="/login" className="text-gold hover:underline">Entrar</Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}

const benefits = [
  {
    icon: Users,
    title: 'Clientes premium',
    description: 'Executivos, médicos e empresários acostumados a pagar R$130–R$150 por corte em barbearia de alto padrão.',
  },
  {
    icon: DollarSign,
    title: 'Você fica com 70%',
    description: 'Comissão de 30% apenas. 100% da taxa de deslocamento vai direto para você, sem divisão.',
  },
  {
    icon: Shield,
    title: 'Pagamento garantido',
    description: 'Pagamento cobrado no ato da confirmação. Cancela em cima da hora? Você recebe mesmo assim.',
  },
  {
    icon: Clock,
    title: 'Sua agenda, suas regras',
    description: 'Defina seu raio de atendimento, horários disponíveis e aceite só os agendamentos que quiser.',
  },
  {
    icon: Star,
    title: 'Reputação que vale',
    description: 'Score acumulado ao longo do tempo. Quanto melhor sua nota, mais destaque você recebe nas buscas.',
  },
  {
    icon: TrendingUp,
    title: 'Repasse em 24h',
    description: 'Sem burocracia. Seu dinheiro cai na conta em 24h após o atendimento, via Stripe.',
  },
]

const earningPoints = [
  'Ticket médio de R$130–R$150 por atendimento',
  '100% da taxa de deslocamento direto para você',
  'Recebe mesmo se o cliente cancelar em cima da hora',
  'Repasse automático em 24h via Stripe',
  'Relatório mensal com todos os seus ganhos',
]

const earningsExample = [
  { label: '20 atendimentos × R$130',       value: 'R$2.600' },
  { label: 'Comissão Blade Club (30%)',      value: '– R$780' },
  { label: 'Taxa de deslocamento (média)',   value: '+ R$120' },
  { label: 'Líquido recebido no mês',        value: 'R$1.940', highlight: true },
]

const requirements = [
  {
    title: 'Identidade verificada',
    description: 'CPF, foto do documento e selfie. Garantia de segurança para os clientes.',
  },
  {
    title: 'Portfólio de qualidade',
    description: 'Fotos do trabalho e link do Instagram. Mostre o que você sabe fazer.',
  },
  {
    title: 'Compromisso com o padrão',
    description: 'Pontualidade, postura e qualidade acima de 4.0 estrelas. Simples assim.',
  },
]
