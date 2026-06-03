import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-blade-card border-t border-blade-border text-blade-muted">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Image src="/logo.svg" alt="Blade Club" width={120} height={38} className="mb-4" />
            <p className="text-sm text-blade-muted leading-relaxed">
              Marketplace premium de barbeiros a domicílio em Curitiba/PR.
            </p>
            <p className="mt-3 text-gold italic text-sm font-display">
              Seu barbeiro. Onde você estiver.
            </p>
          </div>

          <div>
            <h4 className="text-blade-text font-semibold text-sm mb-4 tracking-wider uppercase">Para clientes</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/buscar" className="hover:text-blade-text hover:text-gold transition-colors">Encontrar barbeiro</Link></li>
              <li><Link href="/cadastro/cliente" className="hover:text-gold transition-colors">Criar conta</Link></li>
              <li><Link href="/login" className="hover:text-gold transition-colors">Entrar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-blade-text font-semibold text-sm mb-4 tracking-wider uppercase">Para barbeiros</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/barbeiros" className="hover:text-gold transition-colors">Trabalhe conosco</Link></li>
              <li><Link href="/cadastro/barbeiro" className="hover:text-gold transition-colors">Cadastrar-se</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-blade-text font-semibold text-sm mb-4 tracking-wider uppercase">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/termos" className="hover:text-gold transition-colors">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-gold transition-colors">Privacidade (LGPD)</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blade-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; {new Date().getFullYear()} Blade Club. Todos os direitos reservados. Curitiba, PR.</span>
          <span className="text-gold tracking-widest uppercase text-[10px]">Blade Club</span>
        </div>
      </div>
    </footer>
  )
}
