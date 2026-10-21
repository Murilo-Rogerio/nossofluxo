'use client'

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Pencil,
  Plus,
  Repeat,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { deleteExpense, updateExpense } from '@/lib/actions/expenses'
import { categoryOptions, resolveCategory } from '@/lib/categories'
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
import type { Category, Expense, ProjectedExpense, RecurrenceType } from '@/lib/types'

interface ExpenseListProps {
  items: ProjectedExpense[]
  customCategories: Category[]
}

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'

export function ExpenseList({ items, customCategories }: ExpenseListProps) {
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  // Filtros
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOption, setSortOption] = useState<SortOption>('date_desc')

  const categories = useMemo(() => categoryOptions(customCategories), [customCategories])

  const filteredItems = useMemo(() => {
    return items
      .filter(({ expense }) => {
        const matchesSearch =
          !search.trim() ||
          expense.name.toLowerCase().includes(search.toLowerCase().trim())
        const matchesCat =
          categoryFilter === 'all' || expense.category === categoryFilter
        return matchesSearch && matchesCat
      })
      .sort((a, b) => {
        if (sortOption === 'date_desc') return b.date.localeCompare(a.date)
        if (sortOption === 'date_asc') return a.date.localeCompare(b.date)
        if (sortOption === 'amount_desc') return b.expense.amount - a.expense.amount
        if (sortOption === 'amount_asc') return a.expense.amount - b.expense.amount
        return 0
      })
  }, [items, search, categoryFilter, sortOption])

  const totalFiltered = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.expense.amount, 0)
  }, [filteredItems])

  const hasActiveFilters = search.trim().length > 0 || categoryFilter !== 'all' || sortOption !== 'date_desc'

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setSortOption('date_desc')
  }

  const confirmDelete = () => {
    if (!deletingItem) return
    startDeleteTransition(async () => {
      await deleteExpense(deletingItem.id)
      setDeletingItem(null)
    })
  }

  if (items.length === 0) {
    return (
      <div className="px-5 pb-5 pt-3">
        <EmptyState
          icon={Plus}
          title="Nenhum gasto registrado"
          description="Adicione seu primeiro gasto no formulário acima para acompanhá-lo aqui."
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
              placeholder="Buscar gasto por nome..."
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
            {/* Filtro por categoria */}
            <div className="w-44">
              <Select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="h-9 text-xs bg-slate-900/60 border-white/10"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
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
                <option value="date_asc">Mais antigos</option>
                <option value="amount_desc">Maior valor</option>
                <option value="amount_asc">Menor valor</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Resumo dos filtros */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Exibindo <strong className="text-slate-200">{filteredItems.length}</strong> de {items.length} gastos
            {hasActiveFilters && (
              <> · Total filtrado: <strong className="text-rose-400 tabular-nums">{formatBRL(totalFiltered)}</strong></>
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

      {/* ── Lista de lançamentos ── */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Nenhum gasto encontrado com os filtros atuais.
        </div>
      ) : (
        <ul className="divide-y divide-slate-800/60">
          <AnimatePresence initial={false}>
            {filteredItems.map(({ expense, date, isProjected, installment }) => {
              const info = resolveCategory(expense.category, customCategories)
              const Icon = info.icon
              return (
                <motion.li
                  key={expense.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
                    style={{ backgroundColor: `${info.color}1A`, color: info.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{expense.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span>{info.label} · {formatDateBR(date)}</span>
                      {installment && (
                        <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-px text-[10px] font-medium text-indigo-300">
                          {installment.current}/{installment.total}
                        </span>
                      )}
                      {expense.recurrence === 'mensal' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-1.5 py-px text-[10px] font-medium text-slate-400">
                          <Repeat className="h-2.5 w-2.5" />mensal
                        </span>
                      )}
                      {isProjected && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-300">
                          previsto
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 text-sm font-semibold tabular-nums',
                      isProjected ? 'text-slate-500' : 'text-slate-300',
                    )}
                  >
                    −{formatBRL(expense.amount)}
                  </span>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar gasto"
                      onClick={() => setEditing(expense)}
                      className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      aria-label="Excluir gasto"
                      disabled={isDeleting}
                      onClick={() => setDeletingItem({ id: expense.id, name: expense.name })}
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
      {editing && (
        <ExpenseEditDialog
          key={editing.id}
          expense={editing}
          customCategories={customCategories}
          onClose={() => setEditing(null)}
        />
      )}

      {/* ── Modal de Confirmação de Exclusão (Segurança) ── */}
      {deletingItem && (
        <Dialog open title="Excluir lançamento" onClose={() => setDeletingItem(null)}>
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
                {isDeleting ? 'Excluindo...' : 'Sim, excluir gasto'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}

function ExpenseEditDialog({
  expense,
  customCategories,
  onClose,
}: {
  expense: Expense
  customCategories: Category[]
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(updateExpense, {})
  const [recurrence, setRecurrence] = useState<RecurrenceType>(expense.recurrence)
  const categories = categoryOptions(customCategories)
  const today = todayISO()

  useEffect(() => {
    if (state.success) onClose()
  }, [state, onClose])

  return (
    <Dialog open title="Editar gasto" onClose={onClose}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={expense.id} />

        <div>
          <Label htmlFor="edit-expense-name">Nome do gasto</Label>
          <Input id="edit-expense-name" name="name" defaultValue={expense.name} required maxLength={120} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="edit-expense-amount">Valor (R$)</Label>
            <Input
              id="edit-expense-amount"
              name="amount"
              inputMode="decimal"
              defaultValue={toEditableNumber(expense.amount)}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-expense-spent-at">Data</Label>
            <Input
              id="edit-expense-spent-at"
              name="spent_at"
              type="date"
              defaultValue={expense.spent_at}
              max={today}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-expense-category">Categoria</Label>
          <Select id="edit-expense-category" name="category" defaultValue={expense.category}>
            {categories.map(c => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-expense-recurrence">Recorrência</Label>
          <Select
            id="edit-expense-recurrence"
            name="recurrence"
            value={recurrence}
            onChange={e => setRecurrence(e.target.value as RecurrenceType)}
          >
            <option value="unica">Compra única</option>
            <option value="mensal">Conta mensal fixa</option>
            <option value="parcelada">Compra parcelada</option>
          </Select>
        </div>

        {recurrence === 'parcelada' && (
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/5 bg-slate-950/40 p-3">
            <div>
              <Label htmlFor="edit-installment-number">Parcela atual</Label>
              <Input
                id="edit-installment-number"
                name="installment_number"
                type="number"
                min={1}
                max={48}
                defaultValue={expense.installment_number ?? 1}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-installments-total">Total de parcelas</Label>
              <Input
                id="edit-installments-total"
                name="installments_total"
                type="number"
                min={2}
                max={48}
                defaultValue={expense.installments_total ?? 2}
                required
              />
            </div>
          </div>
        )}

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
