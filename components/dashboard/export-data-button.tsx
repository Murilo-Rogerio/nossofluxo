'use client'

import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBRL, formatDateBR } from '@/lib/format'
import type { Category, ProjectedExpense, ProjectedIncome } from '@/lib/types'
import { resolveCategory } from '@/lib/categories'

interface ExportDataButtonProps {
  monthKey: string
  incomeItems: ProjectedIncome[]
  expenseItems: ProjectedExpense[]
  customCategories: Category[]
}

export function ExportDataButton({
  monthKey,
  incomeItems,
  expenseItems,
  customCategories,
}: ExportDataButtonProps) {
  const [downloaded, setDownloaded] = useState(false)

  const handleExport = () => {
    // Cabeçalho CSV
    const rows = [
      ['Data', 'Tipo', 'Descrição', 'Categoria / Origem', 'Valor (R$)', 'Status / Parcela'],
    ]

    // Entradas
    for (const item of incomeItems) {
      rows.push([
        formatDateBR(item.date),
        'Entrada',
        `"${item.income.name.replace(/"/g, '""')}"`,
        item.income.source_type === 'fixo' ? 'Salário/Fixa' : 'Extra/Variável',
        item.income.amount.toFixed(2).replace('.', ','),
        item.isProjected ? 'Previsto' : 'Confirmado',
      ])
    }

    // Gastos
    for (const item of expenseItems) {
      const cat = resolveCategory(item.expense.category, customCategories)
      const installmentLabel = item.installment
        ? `Parcela ${item.installment.current}/${item.installment.total}`
        : item.expense.recurrence === 'mensal'
        ? 'Recorrente mensal'
        : 'À vista'

      rows.push([
        formatDateBR(item.date),
        'Gasto',
        `"${item.expense.name.replace(/"/g, '""')}"`,
        cat.label,
        (-item.expense.amount).toFixed(2).replace('.', ','),
        item.isProjected ? `Previsto (${installmentLabel})` : installmentLabel,
      ])
    }

    const csvContent = '\uFEFF' + rows.map(r => r.join(';')).join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `cofre_financas_${monthKey}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2500)
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      className="gap-2 text-xs border border-white/10 hover:border-white/20 hover:text-slate-100"
      title="Exportar lançamentos do mês para Excel (CSV)"
    >
      {downloaded ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400">Exportado!</span>
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5 text-slate-400" />
          <span>Exportar CSV</span>
        </>
      )}
    </Button>
  )
}
