'use client'

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarClock,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { deleteIncome, updateIncome } from '@/lib/actions/incomes'
import { SOURCE_META } from '@/lib/categories'
import { todayISO } from '@/lib/date'
import { formatBRL, formatDateBR, toEditableNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/cn'
import type { Income, ProjectedIncome } from '@/lib/types'

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'

export function IncomeList({ items }: { items: ProjectedIncome[] }) {
  const [editing, setEditing] = useState<Income | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  // Filtros
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sortOption, setSortOption] = useState<SortOption>('date_desc')

  const filteredItems = useMemo(() => {
    return items
      .filter(({ income }) => {
        const matchesSearch =
          !search.trim() ||
          income.name.toLowerCase().includes(search.toLowerCase().trim())
        const matchesSource =
          sourceFilter === 'all' ||
          (sourceFilter === 'fixed' && income.is_fixed_monthly) ||
          (sourceFilter === 'variable' && !income.is_fixed_monthly)
        return matchesSearch && matchesSource
      })
      .sort((a, b) => {
        if (sortOption === 'date_desc') return b.date.localeCompare(a.date)
        if (sortOption === 'date_asc') return a.date.localeCompare(b.date)
        if (sortOption === 'amount_desc') return b.income.amount - a.income.amount
        if (sortOption === 'amount_asc') return a.income.amount - b.income.amount
        return 0
      })
  }, [items, search, sourceFilter, sortOption])

  const totalFiltered = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.income.amount, 0)
  }, [filteredItems])

  const hasActiveFilters = search.trim().length > 0 || sourceFilter !== 'all' || sortOption !== 'date_desc'

  const clearFilters = () => {
    setSearch('')
    setSourceFilter('all')
    setSortOption('date_desc')
  }

  const confirmDelete = () => {
    if (!deletingItem) return
    startDeleteTransition(async () => {
      await deleteIncome(deletingItem.id)
      setDeletingItem(null)
    })
  }

  if (items.length === 0) {
    return (
      <div className="px-5 pb-5 pt-3">
        <EmptyState
          icon={Plus}
          title="Nenhuma entrada registrada"
          description="Adicione seu salário ou um extra no formulário acima para acompanhá-lo aqui."
        />
      </div>
    )
  }

  return (
    <>
      {/* ── Barra de busca e filtros ── */}
      <div className="border-b border-white/5 px-5 py-3 space-y-3 bg-slate-950/20">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Campo de pesquisa */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar entrada por nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-900/60 border-white/10 placeholder:text-slate-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filtro por tipo */}
            <div className="w-40">
              <Select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="h-9 text-xs bg-slate-900/60 border-white/10"
              >
                <option value="all">Todas as origens</option>
                <option value="fixed">Fixa mensal</option>
                <option value="variable">Variável / Extra</option>
              </Select>
            </div>

            {/* Ordenação */}
            <div className="w-36">
              <Select
                value={sortOption}
                onChange={e => setSortOption(e.target.value as SortOption)}
                className="h-9 text-xs bg-slate-900/60 border-white/10"
              >
                <option value="date_desc">Mais recentes</option>
                <option value="date_asc">Mais antigas</option>
                <option value="amount_desc">Maior valor</option>
                <option value="amount_asc">Menor valor</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Resumo dos filtros */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Exibindo <strong className="text-slate-200">{filteredItems.length}</strong> de {items.length} entradas
            {hasActiveFilters && (
              <> · Total filtrado: <strong className="text-emerald-400 tabular-nums">{formatBRL(totalFiltered)}</strong></>
            )}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Lista de entradas ── */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Nenhuma entrada encontrada com os filtros atuais.
        </div>
      ) : (
        <ul className="divide-y divide-slate-800/60">
          <AnimatePresence initial={false}>
            {filteredItems.map(({ income, date, isProjected }) => {
              const meta = SOURCE_META[income.source_type]
              const Icon = meta.icon
              return (
                <motion.li
                  key={income.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm', meta.badge)}>
                    <Icon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{income.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span>{meta.label} · {formatDateBR(date)}</span>
                      {income.is_fixed_monthly && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px text-[10px] font-medium text-emerald-300">
                          <CalendarClock className="h-2.5 w-2.5" />
                          fixa · dia {String(income.day_of_month ?? '??').padStart(2, '0')}
                        </span>
                      )}
                      {isProjected && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-300">
                          prevista
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 text-sm font-semibold tabular-nums',
                      isProjected ? 'text-emerald-500/60' : 'text-emerald-300',
                    )}
                  >
                    +{formatBRL(income.amount)}
                  </span>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar entrada"
                      onClick={() => setEditing(income)}
                      className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      aria-label="Excluir entrada"
                      disabled={isDeleting}
                      onClick={() => setDeletingItem({ id: income.id, name: income.name })}
                      className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* ── Diálogo de edição ── */}
      {editing && <IncomeEditDialog key={editing.id} income={editing} onClose={() => setEditing(null)} />}

      {/* ── Modal de Confirmação de Exclusão (Segurança) ── */}
      {deletingItem && (
        <Dialog open title="Excluir entrada" onClose={() => setDeletingItem(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tem certeza que deseja apagar <strong className="text-slate-100">"{deletingItem.name}"</strong>?
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Sim, excluir entrada'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}

function IncomeEditDialog({ income, onClose }: { income: Income; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(updateIncome, {})
  const [isFixed, setIsFixed] = useState(income.is_fixed_monthly)
  const today = todayISO()
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  useEffect(() => {
    if (state.success) onClose()
  }, [state, onClose])

  return (
    <Dialog open title="Editar entrada" onClose={onClose}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={income.id} />

        <div>
          <Label htmlFor="edit-income-name">Nome da entrada</Label>
          <Input id="edit-income-name" name="name" defaultValue={income.name} required maxLength={120} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="edit-income-amount">Valor (R$)</Label>
            <Input
              id="edit-income-amount"
              name="amount"
              inputMode="decimal"
              defaultValue={toEditableNumber(income.amount)}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-income-received-at">Data do recebimento</Label>
            <Input
              id="edit-income-received-at"
              name="received_at"
              type="date"
              defaultValue={income.received_at}
              max={today}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-income-source-type">Tipo de entrada</Label>
          <Select id="edit-income-source-type" name="source_type" defaultValue={income.source_type}>
            <option value="fixo">Salário / fixo</option>
            <option value="variavel">Freela / extra</option>
          </Select>
        </div>

        <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              name="is_fixed_monthly"
              checked={isFixed}
              onChange={e => setIsFixed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            Entrada fixa mensal (repete todo mês)
          </label>

          {isFixed && (
            <div className="mt-3">
              <Label htmlFor="edit-day-of-month">Dia do mês em que cai</Label>
              <Select
                id="edit-day-of-month"
                name="day_of_month"
                defaultValue={String(income.day_of_month ?? 5)}
              >
                {days.map(d => (
                  <option key={d} value={d}>
                    Dia {String(d).padStart(2, '0')}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <FormError message={state.error} />

        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
