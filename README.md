# 💵 Nosso Fluxo — Controle Patrimonial & Financeiro Pessoal

[![Status](https://img.shields.io/badge/Status-Ativo-brightgreen?style=flat-square)]()
[![Framework](https://img.shields.io/badge/Next.js-15%20App%20Router-black?logo=nextdotjs&style=flat-square)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript&style=flat-square)]()
[![Banco](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20RLS-3ECF8E?logo=supabase&style=flat-square)]()
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&style=flat-square)](https://nossofluxo.vercel.app)
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-violet?style=flat-square)]()

Aplicação full-stack para gestão de finanças pessoais e controle patrimonial completo: entradas, gastos, parcelamentos inteligentes, patrimônio e investimentos — com cotações automáticas de CDI em tempo real via BrasilAPI, monitoramento de ações e FIIs via brapi.dev, e arquitetura preparada para Open Finance.

🔗 **Acesse o app ao vivo:** [nossofluxo.vercel.app](https://nossofluxo.vercel.app)

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura e Decisões Técnicas](#-arquitetura-e-decisões-técnicas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar Localmente](#-como-executar-localmente)
- [Licença](#-licença)

---

## 🧭 Visão Geral

O **Nosso Fluxo** foi concebido para eliminar a fricção de planilhas financeiras estáticas e oferecer um ecossistema unificado para controle patrimonial. A aplicação calcula projeções patrimoniais futuras com juros compostos, monitora taxas de mercado em tempo real e entrega controle orçamentário completo com segurança em nível de banco de dados (RLS).

---

## ⚡ Funcionalidades

### 🔐 Autenticação (Supabase Auth)
- Cadastro e login com e-mail e senha, com validação e mensagens de feedback amigáveis.
- Fluxo completo de recuperação de senha ("esqueci minha senha" ➔ e-mail ➔ redefinição segura).
- Página de confirmação de e-mail própria integrada à identidade do app.
- Rotas protegidas por middleware e dupla checagem de sessão em Server Components.

### 📊 Dashboard
- Cards de métricas com contador animado: total recebido, total gasto, saldo líquido e patrimônio acumulado.
- Gráfico de Entradas vs. Saídas vs. CDI nos últimos 6 meses (Recharts).
- Donut de gastos por categoria (padrão e personalizadas).
- Painéis de contas do mês, parcelamentos ativos (com barra de progresso) e próximas entradas previstas.
- Navegação temporal por mês — meses futuros exibem projeções automatizadas com badge **"Projeção"**.

### 💸 Gastos & Entradas
- CRUD completo com categorias customizadas (16 ícones, 10 cores, gerenciador modal).
- Lançamentos únicos, mensais ou parcelados (2 a 48x, ex.: 3/10).
- Entradas fixas mensais (ex.: salário) projetadas automaticamente nos meses futuros.

### 📈 Patrimônio & CDI em Tempo Real
- Taxa CDI em tempo real via BrasilAPI com cache inteligente de 1h e fallback resiliente.
- Percentual do CDI configurável (90%, 100%, 110%...).
- Rendimento bruto e líquido (IR simulado da tabela regressiva) mensal e anual.
- Projeção de juros compostos em 12 meses iniciando no mês atual com valor real guardado.
- Registro completo de histórico de movimentações e resgates.

### 📊 Investimentos (Ações & FIIs)
- Watchlist de FIIs e Ações com cotações atualizadas via brapi.dev.
- Gráfico de dispersão Risco × Retorno com métricas chave (DY, P/VP, amplitude de 52 semanas).
- Fallback automático para dados de demonstração quando a API estiver temporariamente indisponível.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) + React 19 |
| **Linguagem** | TypeScript (strict mode) |
| **Estilização** | Tailwind CSS + tokens utilitários |
| **Banco / Auth** | Supabase — PostgreSQL + Auth + Row Level Security (RLS) |
| **Animações** | Framer Motion |
| **Gráficos** | Recharts |
| **Ícones** | Lucide Icons |
| **APIs Externas** | BrasilAPI (CDI) & brapi.dev (cotações B3) |
| **Deploy** | Vercel |

---

## 🏛️ Arquitetura e Decisões Técnicas

### Segurança em Camadas
1. **Middleware:** Renova tokens de sessão e redireciona usuários não autenticados para `/login`.
2. **Layout Protegido:** O layout do grupo de rotas autenticadas revalida a sessão no servidor.
3. **RLS no PostgreSQL:** Garante no banco que cada consulta toca estritamente as linhas pertencentes ao usuário (`auth.uid() = user_id`).

### Server-First
Leitura de dados prioritária em **Server Components** e mutações via **Server Actions + revalidatePath** — sem rotas de API desnecessárias e com menor footprint de JavaScript no cliente.

### Motor de Recorrência
Em vez de clonar dezenas de registros no banco antecipadamente, cada parcelamento ou entrada fixa é um registro mestre. O motor puro (`lib/recurrence.ts`) materializa dinamicamente as parcelas sob demanda para qualquer mês requisitado.

---

## 📂 Estrutura do Projeto

```text
app/
├── (protected)/            # Rotas autenticadas
│   ├── dashboard/          # Visão geral (cards, gráficos, painéis)
│   ├── entradas/           # Gestão de receitas
│   ├── gastos/             # CRUD e formulários de despesas
│   ├── investimentos/      # Watchlist de FIIs e Ações
│   ├── patrimonio/         # CDI em tempo real e rendimentos
│   └── integracoes/        # Conexões Open Finance
├── auth/callback/          # Handler de verificação de sessão
├── verificar-email/        # Confirmação amigável
├── redefinir-senha/        # Reset de senha
└── login/                  # Autenticação e cadastro
components/                 # Componentes de UI modulares
lib/
├── actions/                # Server Actions
├── api/                    # Clients de APIs externas
├── supabase/               # SSR e browser clients
└── recurrence.ts           # Motor de cálculo de recorrência
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- Conta no Supabase

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone https://github.com/Murilo-Rogerio/nossofluxo.git
cd nossofluxo
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as Variáveis de Ambiente:**
Crie um arquivo `.env.local` na raiz:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

4. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```
Acesse em `http://localhost:3000`.

---

## 📄 Licença

Distribuído sob a licença MIT. Desenvolvido por **Murilo Rogério**.
