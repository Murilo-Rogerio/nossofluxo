'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CreditCard,
  Landmark,
  LayoutDashboard,
  LineChart,
  LogOut,
  PiggyBank,
  TrendingUp,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

const MAIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', short: 'Início', icon: LayoutDashboard },
  { href: '/entradas', label: 'Entradas', short: 'Entradas', icon: TrendingUp },
  { href: '/gastos', label: 'Gastos', short: 'Gastos', icon: CreditCard },
  { href: '/investimentos', label: 'Investimentos', short: 'Investir', icon: LineChart },
  { href: '/patrimonio', label: 'Patrimônio', short: 'Cofrinho', icon: PiggyBank },
] as const

const SECONDARY_NAV = [
  { href: '/integracoes', label: 'Open Finance', icon: Landmark },
] as const

export function AppShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const initialLetter = email ? email.charAt(0).toUpperCase() : 'U'

  return (
    <div className="relative flex min-h-dvh flex-col bg-base text-slate-100 selection:bg-emerald-500/20">
      {/* Halos sutis de fundo decorativo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-emerald-500/[0.04] blur-[120px]" />
        <div className="absolute -bottom-24 right-[10%] h-96 w-96 rounded-full bg-indigo-500/[0.05] blur-[130px]" />
      </div>

      {/* ── Sidebar Desktop (≥1024px) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/5 bg-card/60 backdrop-blur-xl lg:flex">
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-950/50 group-hover:bg-emerald-500/20 transition-colors">
              <PiggyBank className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold tracking-tight text-slate-100">Cofre</p>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Online" />
              </div>
              <p className="text-[11px] text-slate-500">finanças pessoais</p>
            </div>
          </Link>
        </div>

        {/* Links de navegação principal */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Principal
            </p>
            <nav className="mt-2 space-y-1">
              {MAIN_NAV.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-sm shadow-emerald-950/20'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300',
                      )}
                    />
                    <span>{item.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Conexões
            </p>
            <nav className="mt-2 space-y-1">
              {SECONDARY_NAV.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300',
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar: Usuário + Logout */}
        <div className="border-t border-white/5 p-4 bg-slate-950/20">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-white/10 text-xs font-semibold text-emerald-400">
              {initialLetter}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-200" title={email}>
                {email}
              </p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Conectado
              </p>
            </div>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </form>
        </div>
      </aside>

      {/* ── Header Mobile (<1024px) ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-card/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PiggyBank className="h-4 w-4" />
          </span>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold tracking-tight text-slate-100">Cofre</p>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sair da conta"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </header>

      {/* ── Área Principal de Conteúdo ── */}
      <div className="flex-1 lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-32 sm:px-6 lg:pb-12">
          {children}
        </main>
      </div>

      {/* ── Navbar Mobile Inferior: Fixa, perfeitamente espaçada com 20% para cada aba ── */}
      <nav className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-white/10 bg-slate-950/95 backdrop-blur-xl px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden shadow-2xl">
        {MAIN_NAV.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center transition-colors min-w-0',
                active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-transform duration-150',
                  active ? 'scale-110 text-emerald-400' : 'text-slate-400',
                )}
              />
              <span
                className={cn(
                  'text-[10px] tracking-tight leading-none truncate max-w-[56px]',
                  active ? 'font-semibold text-emerald-400' : 'text-slate-400',
                )}
              >
                {item.short}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
