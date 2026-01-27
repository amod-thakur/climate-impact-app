import { useState, useMemo } from 'react'
import { useLocation } from 'wouter'
import { FOODS } from '../data/foods'
import type { FoodCategory } from '../types'
import FoodCard from '../components/FoodCard'
import { useMealBuilderContext } from '../hooks/useMealBuilderContext'

type SortOption = 'co2e_asc' | 'co2e_desc' | 'alpha' | 'category'
type CategoryTab = 'all' | FoodCategory

const CATEGORY_TABS: { key: CategoryTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'vegetables_fruits', label: 'Veg & Fruit' },
  { key: 'whole_grains', label: 'Whole Grains' },
  { key: 'protein', label: 'Protein' },
  { key: 'other', label: 'Other' },
]

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'co2e_asc', label: 'Emissions (low → high)' },
  { key: 'co2e_desc', label: 'Emissions (high → low)' },
  { key: 'alpha', label: 'Alphabetical' },
  { key: 'category', label: 'By category' },
]

function ExplorerPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<CategoryTab>('all')
  const [sort, setSort] = useState<SortOption>('co2e_asc')
  const { addItem } = useMealBuilderContext()
  const [, navigate] = useLocation()

  const filteredAndSorted = useMemo(() => {
    let items = FOODS

    // Filter by category tab
    if (activeTab !== 'all') {
      items = items.filter((f) => f.category === activeTab)
    }

    // Filter by search
    const query = search.trim().toLowerCase()
    if (query) {
      items = items.filter((f) => f.name.toLowerCase().includes(query))
    }

    // Sort
    const sorted = [...items]
    switch (sort) {
      case 'co2e_asc':
        sorted.sort((a, b) => a.co2e_per_portion - b.co2e_per_portion)
        break
      case 'co2e_desc':
        sorted.sort((a, b) => b.co2e_per_portion - a.co2e_per_portion)
        break
      case 'alpha':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
        break
    }

    return sorted
  }, [search, activeTab, sort])

  function handleAddToMeal(id: string) {
    addItem(id)
    navigate('/build')
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-text-primary">Food Explorer</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Browse 45 common foods and their carbon footprint.
      </p>

      {/* Search */}
      <div className="mt-4">
        <label htmlFor="food-search" className="sr-only">
          Search foods
        </label>
        <input
          id="food-search"
          type="search"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Category tabs */}
      <div className="mt-3 flex gap-1 overflow-x-auto" role="tablist" aria-label="Food categories">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="mt-3 flex items-center gap-2">
        <label htmlFor="food-sort" className="text-sm text-text-secondary">
          Sort:
        </label>
        <select
          id="food-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="mt-4 space-y-3">
        {filteredAndSorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            No items match your search.
          </p>
        ) : (
          filteredAndSorted.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onAddToMeal={handleAddToMeal}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ExplorerPage
