'use client'

import { motion } from 'framer-motion'
import { Activity, AlertTriangle, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatBRL, formatPct } from '@/lib/format'
import { cn } from '@/lib/cn'

interface FinancialHealthProps {
  totalIncome: number
  totalExpense: number
  balance: number
  billsTotal: number
}

export function FinancialHealth({
  totalIncome,
  totalExpense,
  balance,
  billsTotal,
}: FinancialHealthProps) {
  // Cálculo da taxa de poupança
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0
  const expenseRate = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0
  const fixedRate = totalIncome > 0 ? Math.round((billsTotal / totalIncome) * 100) : 0

  // Diagnóstico
  let score = 50
  let status = 'Equilibrado'
  let color = 'text-amber-400'
  let badgeBorder = 'border-amber-500/30 bg-amber-500/10'
  let message = 'Seu orçamento está equilibrado, mas manter uma reserva maior dá mais segurança.'
  let Icon = Activity

  if (totalIncome === 0 && totalExpense === 0) {
    score = 50
    status = 'Sem dados'
    color = 'text-slate-400'
    badgeBorder = 'border-slate-500/30 bg-slate-500/10'
    message = 'Adicione entradas e saídas para calcular a saúde financeira do seu mês.'
  } else if (balance < 0) {
    score = Math.max(10, Math.round(50 + (balance / (totalIncome || 1)) * 50))
    status = 'Atenção: Déficit'
    color = 'text-rose-400'
    badgeBorder = 'border-rose-500/30 bg-rose-500/10'
    message = `Seus gastos superaram as entradas em ${formatBRL(Math.abs(balance))}. Tente priorizar cortes em despesas flexíveis.`
    Icon = AlertTriangle
  } else if (savingsRate >= 30) {
    score = Math.min(100, 80 + Math.round((savingsRate - 30) / 2))
    status = 'Excelente'
    color = 'text-emerald-400'
    badgeBorder = 'border-emerald-500/30 bg-emerald-500/10'
    message = `Incrível! Você está poupando ${savingsRate}% dos seus ganhos neste mês. Ritmo ideal para investimentos e patrimônio!`
    Icon = ShieldCheck
  } else if (savingsRate >= 15) {
    score = 75
    status = 'Muito Bom'
    color = 'text-emerald-300'
    badgeBorder = 'border-emerald-500/20 bg-emerald-500/10'
    message = `Muito bem! Com ${savingsRate}% de economia, você segue acima da média recomendada de 10-15%.`
    Icon = CheckCircle2
  } else {
    score = 60
    status = 'Estável'
    color = 'text-amber-300'
    badgeBorder = 'border-amber-500/20 bg-amber-500/10'
    message = `Você está fechando no positivo (${savingsRate}% livre). Que tal definir um teto para aumentar a sobra?`
    Icon = TrendingUp
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="relative overflow-hidden border-white/10 p-5 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', badgeBorder, color)}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Saúde Financeira
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', badgeBorder, color)}>
                  {status} · {score}/100
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{message}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <p className="text-slate-400">Taxa de Poupança</p>
              <p className={cn('text-sm font-bold tabular-nums', color)}>
                {savingsRate > 0 ? `+${savingsRate}%` : `${savingsRate}%`}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-slate-400">Comprometido</p>
              <p className="text-sm font-bold tabular-nums text-slate-200">
                {expenseRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Distribuição */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 flex">
            {totalIncome > 0 && (
              <>
                <div
                  className="bg-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, fixedRate)}%` }}
                  title={`Contas fixas: ${fixedRate}%`}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, expenseRate - fixedRate))}%` }}
                  title={`Outros gastos: ${Math.max(0, expenseRate - fixedRate)}%`}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.max(0, savingsRate)}%` }}
                  title={`Sobra/Poupança: ${savingsRate}%`}
                />
              </>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-indigo-500" />
                Contas fixas ({fixedRate}%)
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-rose-500" />
                Gastos livres ({Math.max(0, expenseRate - fixedRate)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-emerald-500" />
                Sobra ({Math.max(0, savingsRate)}%)
              </span>
            </div>
            <span>Regra 50/30/20 de referência</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
