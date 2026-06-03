# Blade Club — CLAUDE.md

> Domínio sugerido: bladeclub.com.br

---

## O que é este projeto

**Blade Club** — marketplace premium de barbeiros a domicílio, focado no público de alta renda de Curitiba.
O cliente agenda um barbeiro verificado que vai até o local desejado.
Posicionamento: exclusividade, segurança e conveniência — não é "Uber de barbeiro popular", é serviço premium de alto padrão.

**Slogan:** *Seu barbeiro. Onde você estiver.*

---

## Status atual

- Fase: MVP site (validação do modelo)
- Região de lançamento: Curitiba/PR
- App mobile: fase 2 (não desenvolver agora)
- Próxima decisão pendente: nome do projeto (consulta INPI em andamento)

---

## Stack técnica

```
Frontend:     Next.js 14 + TypeScript + Tailwind CSS
Backend/DB:   Supabase (PostgreSQL + Auth + Storage + Realtime)
Hospedagem:   Vercel (gratuito no MVP)
Pagamento:    Stripe Connect Express (split automático)
Mapas:        Google Maps API (distância + localização)
Agenda:       Google Calendar API
Mensagens:    Supabase Realtime (chat interno)
Contratos:    Aceite digital via checkbox no cadastro
LGPD/Termos: iubenda.com
```

---

## CNPJ e fiscal

- **CNPJ atual:** Empresário Individual (EI) em nome do fundador
- **Uso no MVP:** receita de comissão entra pelo CNPJ atual
- **Ação necessária antes de lançar:** adicionar CNAE 7490-1/04 (atividades de intermediação) ao CNPJ atual
- **Conta bancária:** abrir conta separada para Blade Club ainda no mesmo CNPJ para separar fluxo de caixa
- **Fase 2 (após validação):** abrir SLU (Sociedade Limitada Unipessoal) exclusiva para Blade Club, migrar Stripe Connect e operação

> ⚠️ EI não protege patrimônio pessoal. Abrir LTDA/SLU é prioridade assim que o modelo validar.

---

## Modelo de negócio

### Pagamento

**MVP atual (fase 1):** pagamento presencial no dia do atendimento via maquininha (InfinitePay). O app gerencia apenas o agendamento — o split financeiro é feito manualmente pelo operador.

**Fase 2 (após validação):** integrar Stripe Connect Express para split automático online.
- Cliente paga 100% no momento do aceite do barbeiro
- Split automático: plataforma retém 30%, barbeiro recebe 70%
- Barbeiro não precisa criar conta Stripe — link de onboarding enviado pela plataforma

### Comissão da plataforma
- Comissão fixa de **30%** sobre o valor dos serviços, desde o lançamento.

> A comissão reflete o investimento em marketing da plataforma para trazer clientes que o barbeiro não alcançaria sozinho. Comunicar isso claramente no onboarding do barbeiro.

### Taxa de processamento Stripe
A taxa de processamento do Stripe (~3,5% + R$0,39 por transação) é deduzida do valor bruto pago pelo cliente **antes** da aplicação do split 30/70. O cliente paga o valor integral; a plataforma absorve o custo de processamento internamente.

**Ordem de cálculo:**
1. Cliente paga o valor bruto
2. Stripe desconta sua taxa (~3,5% + R$0,39)
3. O split 30/70 é aplicado sobre o valor líquido resultante

**Exemplo — corte de R$120,00:**
```
Valor pago pelo cliente         R$120,00
Taxa Stripe (3,5% + R$0,39)    -  R$4,59
                               ──────────
Valor líquido (base do split)   R$115,41

Plataforma (30%)                - R$34,62  [não exibido ao cliente]
Repasse ao barbeiro (70%)         R$80,79  [não exibido ao cliente]
```

> Os valores exatos variam conforme o plano Stripe contratado. A taxa de ~3,5% + R$0,39 é uma estimativa para o plano padrão no Brasil. Usar a API do Stripe para calcular o valor real em cada transação.

### Taxa de deslocamento
- Calculada em tempo real via Google Maps API (distância do endereço atual do barbeiro até o cliente)
- Até 3km: **grátis**
- Acima de 3km: **R$2,00/km adicional**
- 100% da taxa vai para o barbeiro — não entra na base de cálculo da comissão
- Exibida de forma transparente no checkout antes da confirmação

**Exemplo no checkout:**
```
Corte                R$120,00
Deslocamento (7km)    R$8,00
─────────────────────────────
Total               R$128,00
Comissão plataforma (30%)  R$36,00  [não exibido ao cliente]
Repasse ao barbeiro         R$92,00 [não exibido ao cliente]
```

### Preços mínimos obrigatórios
Barbeiro não pode cadastrar serviço abaixo dos valores mínimos:

| Serviço | Mínimo |
|---|---|
| Corte | R$80,00 |
| Barba | R$70,00 |
| Combo corte + barba | R$130,00 |
| Tratamento capilar | R$120,00 |

### Responsabilidade fiscal
- A **plataforma** emite nota fiscal exclusivamente sobre sua comissão (os 30% que efetivamente recebeu).
- O **barbeiro** é responsável por emitir nota fiscal ou RPA sobre o valor que efetivamente recebeu (os 70% líquidos após a taxa Stripe).
- Cada parte declara ao fisco apenas o que recebeu — não há bitributação sobre o valor total da transação.
- Essa divisão está registrada no contrato de adesão do barbeiro e deve ser comunicada claramente no onboarding.

> Recomendação ao barbeiro: emitir RPA (Recibo de Pagamento a Autônomo) ou nota fiscal de MEI a cada repasse recebido, dependendo do seu enquadramento tributário.

---

## Política de cancelamento e no-show

### Se o cliente cancelar
| Antecedência | Reembolso ao cliente |
|---|---|
| Mais de 4 horas antes | 100% |
| Menos de 4 horas antes | 50% (50% fica com o barbeiro) |
| Não atende a porta | 0% (100% fica com o barbeiro) |

### Se o barbeiro não aparecer
| Ocorrência | Cliente | Plataforma | Barbeiro |
|---|---|---|---|
| 1ª vez | Reembolso 100% | Recebe comissão normalmente | Recebe R$0 + advertência no perfil |
| 2ª vez | Reembolso 100% | Recebe comissão normalmente | Recebe R$0 + suspensão 7 dias |
| 3ª vez | Reembolso 100% | Recebe comissão normalmente | Recebe R$0 + exclusão permanente |

> Lógica: a plataforma investiu em marketing para trazer aquele cliente. O barbeiro que falta absorve o prejuízo total. A plataforma não pode sair no prejuízo por falha do profissional.

---

## Fluxo de agendamento

```
1. Cliente busca barbeiro
   → por serviço + região + disponibilidade
   → ordenação: barbeiros verificados primeiro → nota ≥ 4.0 → distância

2. Cliente envia solicitação
   → seleciona serviço
   → informa endereço de atendimento
   → sugere 2–3 opções de horário

3. Barbeiro recebe notificação
   → push notification + WhatsApp
   → 3 opções de resposta:
     a) Aceita um dos horários sugeridos
     b) Propõe horário alternativo
     c) Recusa (sem penalidade se esporádico)

4. Cliente confirma horário final
   → pagamento cobrado 100% via Stripe
   → ambos recebem confirmação (SMS + WhatsApp)

5. Dia do atendimento
   → barbeiro faz check-in de chegada pelo app (confirma localização)
   → atendimento realizado

6. Pós-atendimento
   → barbeiro faz check-out
   → avaliação dupla obrigatória (cliente avalia barbeiro, barbeiro avalia cliente)
   → repasse ao barbeiro em 24h via Stripe
   → barbeiro pode subir foto do resultado como portfólio
```

---

## Raio de atendimento

### MVP (implementar agora)
- Barbeiro configura raio fixo no perfil (ex: 10km a partir do endereço base cadastrado)
- Mínimo: 2km | Máximo: 30km
- Cliente vê a distância antes de agendar

### Fase 2 (registrado — não implementar agora)
- Raio dinâmico em tempo real via GPS do barbeiro
- Plataforma usa localização atual para calcular distância e mostrar solicitações próximas
- Após aceitar agendamento, raio passa a ser calculado a partir do endereço de destino (não da localização atual) — evita zigue-zague pela cidade
- Lógica de rota encadeada: barbeiro só vê próximos clientes próximos ao seu próximo destino

---

## Segurança e verificação

### Camadas de segurança no cadastro do barbeiro (MVP)
1. **Identidade:** CPF + foto do documento + selfie
2. **Portfólio:** fotos do trabalho + link Instagram
3. **Aceite de contrato:** documento digital com cláusulas de responsabilidade, comissão e punições por bypass — aceito via checkbox no cadastro

### Fase 2 — verificação avançada (não implementar agora)
- Verificação biométrica via API (Unico Check ou Idwall) — ~R$2/verificação
- Consulta antecedentes criminais (Serasa) — ~R$5/consulta
- Implementar quando tiver volume e receita para cobrir o custo

### Score de reputação
- Barbeiro novo: acesso limitado (máx. 5 agendamentos/semana até completar 10 avaliações)
- Score sobe por atendimento concluído + avaliação positiva
- Suspensão automática se nota média cair abaixo de 3.5 estrelas
- Destaque "Novo na plataforma" por 30 dias para barbeiros sem histórico (evita invisibilidade)

---

## Prevenção de bypass (cliente e barbeiro combinarem fora da plataforma)

### Camada técnica
- Chat interno bloqueia automaticamente mensagens com sequências numéricas (telefone, WhatsApp)
- Bloqueia também @handles e links externos
- Mensagem bloqueada exibe aviso ao usuário

### Camada contratual (no termo de adesão do barbeiro)
- **Responsabilidade fiscal:** o barbeiro é responsável por emitir nota fiscal ou RPA sobre o valor que recebeu. A plataforma emite nota fiscal apenas sobre sua comissão. Cada parte declara ao fisco exclusivamente o que efetivamente recebeu.
- Multa de R$500,00 por atendimento comprovado fora da plataforma
- Exclusão imediata e permanente do cadastro
- Perda de todo o histórico de avaliações acumulado
- Cláusula de não-concorrência: clientes originados pela plataforma devem ser atendidos por ela pelos 12 meses seguintes ao primeiro contato

### Camada de detecção
- Formulário de avaliação pós-serviço inclui verificação implícita: "esse atendimento foi agendado normalmente pela plataforma?"
- Sistema sinaliza para revisão manual casos onde houve conversa no chat mas sem agendamento registrado

### Camada de retenção (mais importante)
- Fazer o barbeiro sentir que perder o acesso dói mais do que ganhar um cliente direto
- Relatório mensal mostrando quanto a plataforma gerou para ele
- Score de reputação acumulado — anos para construir, perde em um clique
- Acesso a clientela premium que ele não alcançaria sozinho

---

## Estrutura do banco de dados (Supabase)

```sql
-- Usuários (auth gerenciado pelo Supabase Auth)
profiles (
  id uuid references auth.users,
  type text, -- 'client' | 'barber' | 'admin'
  full_name text,
  cpf text,
  phone text,
  avatar_url text,
  created_at timestamp
)

-- Perfil do barbeiro
barbers (
  id uuid references profiles,
  bio text,
  instagram_url text,
  document_url text,        -- foto do documento
  selfie_url text,
  status text,              -- 'pending' | 'verified' | 'suspended' | 'banned'
  rating_avg decimal,
  rating_count integer,
  service_radius_km integer,
  base_address text,
  base_lat decimal,
  base_lng decimal,
  stripe_account_id text,   -- Stripe Connect Express account ID
  warnings_count integer default 0,
  created_at timestamp
)

-- Serviços oferecidos pelo barbeiro
barber_services (
  id uuid,
  barber_id uuid references barbers,
  service_type text,        -- 'haircut' | 'beard' | 'combo' | 'treatment'
  name text,
  price decimal,            -- não pode ser menor que o mínimo da plataforma
  duration_minutes integer,
  active boolean default true
)

-- Clientes
clients (
  id uuid references profiles,
  default_address text,
  default_lat decimal,
  default_lng decimal,
  stripe_customer_id text
)

-- Agendamentos
bookings (
  id uuid,
  client_id uuid references clients,
  barber_id uuid references barbers,
  service_id uuid references barber_services,
  status text,              -- 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'no_show_client' | 'no_show_barber'
  address text,
  lat decimal,
  lng decimal,
  scheduled_at timestamp,
  distance_km decimal,
  service_price decimal,
  travel_fee decimal,
  total_amount decimal,
  platform_fee decimal,     -- comissão da plataforma
  barber_payout decimal,    -- valor repassado ao barbeiro
  stripe_payment_intent_id text,
  check_in_at timestamp,
  check_out_at timestamp,
  created_at timestamp
)

-- Horários sugeridos pelo cliente (antes do aceite)
booking_time_suggestions (
  id uuid,
  booking_id uuid references bookings,
  suggested_at timestamp,
  proposed_by text          -- 'client' | 'barber'
)

-- Avaliações
reviews (
  id uuid,
  booking_id uuid references bookings,
  reviewer_id uuid references profiles,
  reviewed_id uuid references profiles,
  rating integer,           -- 1 a 5
  comment text,
  portfolio_photo_url text, -- foto do resultado (só barbeiro preenche)
  created_at timestamp
)

-- Chat interno
messages (
  id uuid,
  booking_id uuid references bookings,
  sender_id uuid references profiles,
  content text,
  blocked boolean default false,
  created_at timestamp
)

-- Notificações de bypass detectado
bypass_flags (
  id uuid,
  booking_id uuid references bookings,
  reason text,
  reviewed boolean default false,
  created_at timestamp
)
```

---

## Escopo do MVP — o que entra agora

### Páginas públicas
- [ ] Landing page (proposta de valor, como funciona, CTA para cliente e barbeiro)
- [ ] Página de cadastro do barbeiro
- [ ] Página de cadastro do cliente
- [ ] Página de busca de barbeiros (por região/serviço)
- [ ] Perfil público do barbeiro (foto, serviços, avaliações, portfólio)

### Área do cliente (autenticado)
- [ ] Dashboard com próximos agendamentos
- [ ] Fluxo de agendamento completo (busca → solicitar → confirmar horário → pagar)
- [ ] Histórico de agendamentos
- [ ] Chat interno com barbeiro (por agendamento)
- [ ] Avaliação pós-serviço

### Área do barbeiro (autenticado)
- [ ] Dashboard com agenda da semana
- [ ] Gerenciamento de serviços e preços
- [ ] Configuração de raio de atendimento
- [ ] Notificações de solicitação (aceitar / propor horário / recusar)
- [ ] Check-in e check-out de atendimento
- [ ] Upload de foto do resultado (portfólio)
- [ ] Histórico de atendimentos
- [ ] Painel financeiro: ganhos do mês, comissão descontada, valor líquido recebido
- [ ] Avaliações recebidas

### Admin (back-office simples)
- [ ] Lista de barbeiros pendentes de aprovação
- [ ] Aprovar / rejeitar cadastro de barbeiro
- [ ] Visualizar flags de bypass
- [ ] Aplicar advertências e suspensões manualmente

---

## O que NÃO entra no MVP (fase 2)

- App mobile iOS/Android (React Native / Expo — aproveita 100% das APIs já construídas)
- Verificação biométrica via API externa (Unico Check / Idwall)
- Consulta de antecedentes criminais (Serasa)
- Raio dinâmico em tempo real via GPS
- Sistema de fidelidade (X cortes = desconto)
- Expansão para outras cidades
- Migração para CNPJ SLU exclusivo
- Migração para modelo intermediário de pagamento (plataforma recebe tudo e repassa)

---

## Variáveis de ambiente necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLATFORM_FEE_PERCENT=30

# Google
GOOGLE_MAPS_API_KEY=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://Blade Club.com.br
NEXT_PUBLIC_APP_NAME=Blade Club

# Regras de negócio (fácil de alterar sem mexer no código)
NEXT_PUBLIC_MIN_PRICE_HAIRCUT=80
NEXT_PUBLIC_MIN_PRICE_BEARD=70
NEXT_PUBLIC_MIN_PRICE_COMBO=130
NEXT_PUBLIC_MIN_PRICE_TREATMENT=120
NEXT_PUBLIC_FREE_TRAVEL_KM=3
NEXT_PUBLIC_TRAVEL_FEE_PER_KM=2
NEXT_PUBLIC_CANCELLATION_WINDOW_HOURS=4
NEXT_PUBLIC_PLATFORM_COMMISSION=0.30
```

---

## Decisões registradas para o futuro

| Decisão | Status | Quando revisar |
|---|---|---|
| Migrar pagamento para modelo intermediário (plataforma recebe tudo) | Registrado — não implementar agora | Após validação com 50+ atendimentos |
| Raio dinâmico em tempo real via GPS | Registrado — não implementar agora | Após feedback real de uso |
| Verificação biométrica e antecedentes criminais | Registrado — não implementar agora | Quando tiver volume e receita para cobrir custo |
| Abrir SLU exclusiva para Blade Club | Registrado — não implementar agora | Após validação do modelo |
| App mobile React Native | Registrado — fase 2 | Após 50+ atendimentos mensais recorrentes |

---

## Contexto do fundador

- **Localização:** Curitiba/PR
- **Relevância:** barbeiro ativo com experiência em atendimento a domicílio
- **Stack familiar:** Next.js 14 + TypeScript + Tailwind + Supabase + Stripe 
- **Público-alvo:** executivos, médicos, empresários de Curitiba — clientes acostumados a pagar R$130–R$142 por corte em barbearia premium
- **Diferencial competitivo:** fundador conhece os dois lados do mercado (cliente e profissional)

---

## Comandos úteis

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build
npm run build

# Deploy (automático via Vercel no push para main)
git push origin main
```
