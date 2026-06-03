import Link from 'next/link'
import Image from 'next/image'
import { Shield, Clock, Star, ChevronRight, CheckCircle, MapPin } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function LandingPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center bg-blade-bg overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#C9A84C08,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:py-40 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs font-medium tracking-[0.3em] uppercase">Blade Club</span>
            </div>

            <h1 className="font-display text-5xl lg:text-7xl font-bold text-blade-text leading-[1.08] tracking-tight text-balance">
              O barbeiro premium<br />vem até você
            </h1>

            <p className="mt-5 text-xl lg:text-2xl text-gold italic font-display">
              Seu barbeiro. Onde você estiver.
            </p>

            <p className="mt-6 text-base lg:text-lg text-blade-muted max-w-xl leading-relaxed">
              Barbeiros verificados, no seu endereço, no horário que você escolher.
              Sem filas, sem deslocamento — o padrão das melhores barbearias de Curitiba, na sua casa ou escritório.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/buscar"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-blade-bg hover:bg-gold-light transition-colors"
              >
                Agendar agora <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-full border border-blade-border px-8 py-3.5 text-sm font-medium text-blade-text hover:border-gold hover:text-gold transition-colors"
              >
                Como funciona
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold shrink-0" />
              <span className="text-sm text-blade-muted">Atendemos em Curitiba e região</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-y border-blade-border bg-blade-card">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-sm text-blade-muted">
            {[
              { icon: Shield, label: 'Barbeiros verificados com CPF e documento' },
              { icon: Star,   label: 'Apenas profissionais acima de 4.0 estrelas' },
              { icon: Clock,  label: 'Pagamento cobrado só após confirmação' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-gold shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-28 bg-blade-bg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Processo</span>
              <div className="h-px w-8 bg-gold" />
            </div>
            <h2 className="font-display text-4xl font-bold text-blade-text">Como funciona</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-blade-card border border-blade-border rounded-2xl p-8 h-full">
                  <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center text-gold font-display font-bold text-lg mb-6">
                    {i + 1}
                  </div>
                  <h3 className="font-display text-xl font-bold text-blade-text mb-3">{step.title}</h3>
                  <p className="text-blade-muted leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-28 bg-blade-card border-t border-blade-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Serviços</span>
              <div className="h-px w-8 bg-gold" />
            </div>
            <h2 className="font-display text-4xl font-bold text-blade-text">Serviços disponíveis</h2>
            <p className="mt-4 text-blade-muted">Cada barbeiro define seus próprios preços acima dos mínimos da plataforma</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service) => (
              <div key={service.name} className="bg-blade-bg border border-blade-border rounded-2xl p-6 hover:border-gold transition-colors group">
                <div className="h-px w-8 bg-gold mb-5 group-hover:w-12 transition-all" />
                <h3 className="font-display text-lg font-bold text-blade-text mb-2">{service.name}</h3>
                <p className="text-2xl font-bold text-gold">a partir de R${service.minPrice}</p>
                <p className="mt-2 text-sm text-blade-muted">{service.description}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-blade-muted">
            Taxa de deslocamento: grátis até 3 km — R$2,00 por km adicional, 100% repassado ao barbeiro
          </p>
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
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-blade-text mb-4">
            Pronto para agendar?
          </h2>
          <p className="text-xl text-gold italic font-display mb-10">
            Seu barbeiro. Onde você estiver.
          </p>
          <Link
            href="/buscar"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-10 py-4 text-base font-semibold text-blade-bg hover:bg-gold-light transition-colors"
          >
            Encontrar meu barbeiro <ChevronRight className="h-5 w-5" />
          </Link>
          <p className="mt-6 text-sm text-blade-muted">
            É barbeiro?{' '}
            <Link href="/barbeiros" className="text-gold hover:underline">
              Trabalhe com a gente
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}

const steps = [
  {
    title: 'Escolha o barbeiro',
    description: 'Pesquise por serviço e região. Veja portfólio, avaliações reais e disponibilidade de cada profissional verificado.',
  },
  {
    title: 'Solicite o horário',
    description: 'Informe seu endereço e sugira até 3 horários. O barbeiro confirma rapidamente — pagamento só após confirmação.',
  },
  {
    title: 'Receba onde quiser',
    description: 'O barbeiro chega pontualmente. Casa, escritório, hotel — onde for mais cômodo para você.',
  },
]

const services = [
  { name: 'Corte',              minPrice: '80',  description: 'Corte masculino com acabamento profissional' },
  { name: 'Barba',              minPrice: '70',  description: 'Modelagem e hidratação de barba' },
  { name: 'Combo',              minPrice: '130', description: 'Corte + barba com vantagem' },
  { name: 'Tratamento capilar', minPrice: '120', description: 'Hidratação, reconstrução e cuidados especiais' },
]
