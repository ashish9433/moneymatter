import type { ACCOUNT_CATEGORIES } from '@bt/shared/types';
import { useLocalStorage } from '@vueuse/core';

// Module-scoped so the header menu and the page body share one persisted choice, the same
// way `use-accounts-sort.ts` shares its sort key. Defaults: ungrouped, unfiltered, every
// category group expanded (the collapsed list is stored, so a new category starts open).
const isGroupedByCategory = useLocalStorage<boolean>('accounts-page:group-by-category', false);
const categoryFilter = useLocalStorage<ACCOUNT_CATEGORIES[]>('accounts-page:category-filter', []);
const collapsedCategories = useLocalStorage<ACCOUNT_CATEGORIES[]>('accounts-page:collapsed-categories', []);

export function useAccountsCategoryView() {
  const setGroupedByCategory = ({ value }: { value: boolean }): void => {
    isGroupedByCategory.value = value;
  };

  const toggleCategoryFilter = ({ category }: { category: ACCOUNT_CATEGORIES }): void => {
    categoryFilter.value = categoryFilter.value.includes(category)
      ? categoryFilter.value.filter((item) => item !== category)
      : [...categoryFilter.value, category];
  };

  const clearCategoryFilter = (): void => {
    categoryFilter.value = [];
  };

  const isCategoryOpen = ({ category }: { category: ACCOUNT_CATEGORIES }): boolean =>
    !collapsedCategories.value.includes(category);

  const setCategoryOpen = ({ category, open }: { category: ACCOUNT_CATEGORIES; open: boolean }): void => {
    const rest = collapsedCategories.value.filter((item) => item !== category);
    collapsedCategories.value = open ? rest : [...rest, category];
  };

  return {
    isGroupedByCategory,
    categoryFilter,
    setGroupedByCategory,
    toggleCategoryFilter,
    clearCategoryFilter,
    isCategoryOpen,
    setCategoryOpen,
  };
}
