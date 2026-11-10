import type { AccountGroups } from '@/common/types/models';
import { ACCOUNT_CATEGORIES, type AccountModel } from '@bt/shared/types';
import { describe, expect, it } from 'vitest';

import {
  filterAccountsByCategories,
  filterGroupsByCategories,
  groupAccountsByCategory,
} from './accounts-category-grouping';

const makeAccount = ({ id, category }: { id: string; category: ACCOUNT_CATEGORIES }): AccountModel =>
  ({ id, name: id, accountCategory: category }) as unknown as AccountModel;

const makeGroup = ({
  id,
  accounts = [],
  childGroups = [],
}: {
  id: string;
  accounts?: AccountModel[];
  childGroups?: AccountGroups[];
}): AccountGroups => ({ id, name: id, accounts, childGroups }) as unknown as AccountGroups;

const ids = (accounts: AccountModel[]): string[] => accounts.map((account) => account.id);

describe('filterAccountsByCategories', () => {
  const accounts = [
    makeAccount({ id: 'card', category: ACCOUNT_CATEGORIES.creditCard }),
    makeAccount({ id: 'save', category: ACCOUNT_CATEGORIES.saving }),
    makeAccount({ id: 'cash', category: ACCOUNT_CATEGORIES.cash }),
  ];

  it('returns every account when no category is selected', () => {
    expect(ids(filterAccountsByCategories({ accounts, categories: [] }))).toEqual(['card', 'save', 'cash']);
  });

  it('keeps only accounts in the selected categories', () => {
    const result = filterAccountsByCategories({
      accounts,
      categories: [ACCOUNT_CATEGORIES.creditCard, ACCOUNT_CATEGORIES.cash],
    });
    expect(ids(result)).toEqual(['card', 'cash']);
  });
});

describe('filterGroupsByCategories', () => {
  it('returns the same groups when no category is selected', () => {
    const groups = [makeGroup({ id: 'g', accounts: [makeAccount({ id: 'a', category: ACCOUNT_CATEGORIES.cash })] })];
    expect(filterGroupsByCategories({ groups, categories: [] })).toBe(groups);
  });

  it('filters nested accounts and drops folders left empty', () => {
    const groups = [
      makeGroup({
        id: 'parent',
        accounts: [makeAccount({ id: 'save', category: ACCOUNT_CATEGORIES.saving })],
        childGroups: [
          makeGroup({
            id: 'child-hit',
            accounts: [makeAccount({ id: 'card', category: ACCOUNT_CATEGORIES.creditCard })],
          }),
          makeGroup({ id: 'child-miss', accounts: [makeAccount({ id: 'cash', category: ACCOUNT_CATEGORIES.cash })] }),
        ],
      }),
      makeGroup({ id: 'miss', accounts: [makeAccount({ id: 'cash2', category: ACCOUNT_CATEGORIES.cash })] }),
    ];

    const result = filterGroupsByCategories({ groups, categories: [ACCOUNT_CATEGORIES.creditCard] });

    expect(result.map((group) => group.id)).toEqual(['parent']);
    expect(ids(result[0]!.accounts)).toEqual([]);
    expect(result[0]!.childGroups.map((group) => group.id)).toEqual(['child-hit']);
  });
});

describe('groupAccountsByCategory', () => {
  it('buckets accounts in the fixed category order and omits empty categories', () => {
    const accounts = [
      makeAccount({ id: 'card-1', category: ACCOUNT_CATEGORIES.creditCard }),
      makeAccount({ id: 'general', category: ACCOUNT_CATEGORIES.general }),
      makeAccount({ id: 'current', category: ACCOUNT_CATEGORIES.currentAccount }),
      makeAccount({ id: 'card-2', category: ACCOUNT_CATEGORIES.creditCard }),
    ];

    const result = groupAccountsByCategory({ accounts });

    expect(result.map((bucket) => bucket.category)).toEqual([
      ACCOUNT_CATEGORIES.currentAccount,
      ACCOUNT_CATEGORIES.creditCard,
      ACCOUNT_CATEGORIES.general,
    ]);
    expect(ids(result[1]!.accounts)).toEqual(['card-1', 'card-2']);
  });

  it('returns no buckets for no accounts', () => {
    expect(groupAccountsByCategory({ accounts: [] })).toEqual([]);
  });

  it('folds categories that never render here (loan, vehicle) into general instead of dropping them', () => {
    const accounts = [
      makeAccount({ id: 'loan', category: ACCOUNT_CATEGORIES.loan }),
      makeAccount({ id: 'general', category: ACCOUNT_CATEGORIES.general }),
    ];

    const result = groupAccountsByCategory({ accounts });

    expect(result).toHaveLength(1);
    expect(result[0]!.category).toBe(ACCOUNT_CATEGORIES.general);
    expect(ids(result[0]!.accounts)).toEqual(['loan', 'general']);
  });
});
