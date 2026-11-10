import type { AccountGroups } from '@/common/types/models';
import { ACCOUNT_CATEGORIES, type AccountModel } from '@bt/shared/types';

/**
 * Categories a user can group or filter the Accounts page by. Loans are excluded because
 * they live on their own Loans page and never render here; vehicles keep their dedicated
 * section, so they appear only as a filter option (see `ACCOUNTS_FILTERABLE_CATEGORIES`).
 * The array order is the order category groups render in.
 */
export const ACCOUNTS_GROUPABLE_CATEGORIES: readonly ACCOUNT_CATEGORIES[] = [
  ACCOUNT_CATEGORIES.currentAccount,
  ACCOUNT_CATEGORIES.saving,
  ACCOUNT_CATEGORIES.creditCard,
  ACCOUNT_CATEGORIES.cash,
  ACCOUNT_CATEGORIES.bonus,
  ACCOUNT_CATEGORIES.investment,
  ACCOUNT_CATEGORIES.crypto,
  ACCOUNT_CATEGORIES.insurance,
  ACCOUNT_CATEGORIES.overdraft,
  ACCOUNT_CATEGORIES.general,
];

/** Categories offered in the filter: every groupable category plus vehicles (which own a section). */
export const ACCOUNTS_FILTERABLE_CATEGORIES: readonly ACCOUNT_CATEGORIES[] = [
  ...ACCOUNTS_GROUPABLE_CATEGORIES,
  ACCOUNT_CATEGORIES.vehicle,
];

/** One category bucket of accounts, ready to render as a collapsible group. */
export interface AccountCategoryBucket {
  category: ACCOUNT_CATEGORIES;
  accounts: AccountModel[];
}

/** An empty selection means "no filter": every category passes. */
const passesFilter = ({
  category,
  categories,
}: {
  category: ACCOUNT_CATEGORIES;
  categories: readonly ACCOUNT_CATEGORIES[];
}): boolean => categories.length === 0 || categories.includes(category);

export const filterAccountsByCategories = ({
  accounts,
  categories,
}: {
  accounts: AccountModel[];
  categories: readonly ACCOUNT_CATEGORIES[];
}): AccountModel[] =>
  categories.length === 0
    ? accounts
    : accounts.filter((account) => passesFilter({ category: account.accountCategory, categories }));

/**
 * Keep only accounts in the selected categories inside a folder tree, dropping folders whose
 * subtree ends up empty. With no selection the tree is returned untouched.
 */
export const filterGroupsByCategories = ({
  groups,
  categories,
}: {
  groups: AccountGroups[];
  categories: readonly ACCOUNT_CATEGORIES[];
}): AccountGroups[] => {
  if (categories.length === 0) return groups;
  return groups
    .map((group) => ({
      ...group,
      accounts: filterAccountsByCategories({ accounts: group.accounts, categories }),
      childGroups: filterGroupsByCategories({ groups: group.childGroups, categories }),
    }))
    .filter((group) => group.accounts.length > 0 || group.childGroups.length > 0);
};

/**
 * Bucket accounts by category in the fixed render order, omitting empty categories.
 * A category outside `ACCOUNTS_GROUPABLE_CATEGORIES` (e.g. an unexpected legacy value) is
 * placed in the trailing `general` bucket so no account silently disappears.
 */
export const groupAccountsByCategory = ({ accounts }: { accounts: AccountModel[] }): AccountCategoryBucket[] => {
  const buckets = new Map<ACCOUNT_CATEGORIES, AccountModel[]>();
  for (const account of accounts) {
    const category = ACCOUNTS_GROUPABLE_CATEGORIES.includes(account.accountCategory)
      ? account.accountCategory
      : ACCOUNT_CATEGORIES.general;
    const bucket = buckets.get(category);
    if (bucket) bucket.push(account);
    else buckets.set(category, [account]);
  }
  return ACCOUNTS_GROUPABLE_CATEGORIES.filter((category) => buckets.has(category)).map((category) => ({
    category,
    accounts: buckets.get(category)!,
  }));
};
