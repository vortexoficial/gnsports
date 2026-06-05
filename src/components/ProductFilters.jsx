import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { PRODUCT_TYPES } from '../data/options.js'

const sortOptions = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'menor_preco', label: 'Menor preço' },
  { value: 'maior_preco', label: 'Maior preço' },
  { value: 'promocoes', label: 'Ofertas' },
]

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 5v14" />
      <path d="M17 5v14" />
      <path d="M4 8h6" />
      <path d="M14 16h6" />
      <circle cx="7" cy="8" r="2" />
      <circle cx="17" cy="16" r="2" />
    </svg>
  )
}

function DrawerSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={open ? 'filter-drawer-section open' : 'filter-drawer-section'}>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        <span>{title}</span>
        <span className="drawer-chevron" aria-hidden="true" />
      </button>
      {open ? <div className="filter-drawer-section-body">{children}</div> : null}
    </section>
  )
}

function OptionList({ value, options, onChange }) {
  return (
    <div className="filter-option-list">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? 'selected' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function ProductFilters({
  categories,
  filters,
  onChange,
  showSearch = true,
  showCategory = true,
  showType = true,
  showSort = false,
  lockedType = '',
}) {
  const [open, setOpen] = useState(false)

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Todas as categorias' },
      ...categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ],
    [categories],
  )

  const typeOptions = useMemo(
    () => [{ value: '', label: 'Todos os tipos' }, ...PRODUCT_TYPES],
    [],
  )

  const activeFiltersCount = [
    showSearch && filters.search,
    showCategory && filters.categoryId,
    showType && filters.type,
    showSort && filters.sort && filters.sort !== 'recentes',
  ].filter(Boolean).length

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleEscape)
    document.body.classList.toggle('filter-drawer-open', open)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.classList.remove('filter-drawer-open')
    }
  }, [open])

  function updateFilter(name, value) {
    onChange({ ...filters, [name]: value })
  }

  function clearFilters() {
    onChange({
      ...filters,
      search: '',
      categoryId: '',
      type: lockedType,
      sort: showSort ? 'recentes' : filters.sort,
    })
  }

  return (
    <section className="filters-panel">
      <button
        className="filter-icon-button"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Abrir filtros"
        onClick={() => setOpen(true)}
      >
        <FilterIcon />
        <strong>Filtros</strong>
      </button>
      {activeFiltersCount ? <span className="filter-count-badge">{activeFiltersCount}</span> : null}

      {open ? createPortal(
        <div className="filter-drawer-layer">
          <button
            className="filter-drawer-backdrop"
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setOpen(false)}
          />

          <aside className="filter-drawer" role="dialog" aria-modal="true" aria-label="Filtros">
            <header className="filter-drawer-header">
              <FilterIcon />
              <strong>Filtros</strong>
              <button type="button" aria-label="Fechar filtros" onClick={() => setOpen(false)}>
                X
              </button>
            </header>

            <div className="filter-drawer-content">
              {showSearch ? (
                <DrawerSection title="Busca" defaultOpen>
                  <label className="filter-search-field">
                    Produto ou marca
                    <div className="filter-search-wrap">
                      <svg className="filter-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <line x1="16.5" y1="16.5" x2="22" y2="22" />
                      </svg>
                      <input
                        type="search"
                        value={filters.search || ''}
                        onChange={(event) => updateFilter('search', event.target.value)}
                        placeholder="Digite para buscar..."
                      />
                    </div>
                  </label>
                </DrawerSection>
              ) : null}

              {showCategory ? (
                <DrawerSection title="Categoria" defaultOpen={Boolean(filters.categoryId)}>
                  <OptionList
                    value={filters.categoryId || ''}
                    options={categoryOptions}
                    onChange={(value) => updateFilter('categoryId', value)}
                  />
                </DrawerSection>
              ) : null}

              {showType ? (
                <DrawerSection title="Tipo" defaultOpen={Boolean(filters.type)}>
                  <OptionList
                    value={filters.type || ''}
                    options={typeOptions}
                    onChange={(value) => updateFilter('type', value)}
                  />
                </DrawerSection>
              ) : null}

              {showSort ? (
                <DrawerSection title="Ordenar" defaultOpen={Boolean(filters.sort)}>
                  <OptionList
                    value={filters.sort || 'recentes'}
                    options={sortOptions}
                    onChange={(value) => updateFilter('sort', value)}
                  />
                </DrawerSection>
              ) : null}
            </div>

            <footer className="filter-drawer-footer">
              <button className="filter-clear-button" type="button" onClick={clearFilters}>
                Limpar
              </button>
              <button className="filter-apply-button" type="button" onClick={() => setOpen(false)}>
                Aplicar
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </footer>
          </aside>
        </div>,
        document.body
      ) : null}
    </section>
  )
}

export default ProductFilters
