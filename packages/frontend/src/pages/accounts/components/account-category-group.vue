<template>
  <Collapsible v-model:open="isOpen">
    <div class="hover:bg-muted/40 flex items-center gap-3 px-4 py-3 transition-colors">
      <CollapsibleTrigger
        class="focus-visible:ring-ring/40 flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded text-left focus-visible:ring-2 focus-visible:outline-none"
      >
        <ChevronRightIcon
          class="text-muted-foreground size-4 shrink-0 transition-transform"
          :class="{ 'rotate-90': isOpen }"
          aria-hidden="true"
        />
        <span class="min-w-0 truncate text-sm font-semibold">{{
          $t(ACCOUNT_CATEGORIES_TRANSLATION_KEYS[category])
        }}</span>
      </CollapsibleTrigger>
      <div class="flex items-center gap-3">
        <span class="text-muted-foreground shrink-0 text-xs tabular-nums">
          {{ $t('accounts.accountsCount', { count: accounts.length }) }}
        </span>
        <GroupTotal
          v-if="baseCurrencyCode"
          :amount="subtotal.total"
          :currency-code="baseCurrencyCode"
          :is-approx="subtotal.isApprox"
          show-zero
        />
      </div>
    </div>
    <CollapsibleContent>
      <div class="border-border/40 ml-4 border-l pl-2">
        <AccountListRow
          v-for="account in sortedAccounts"
          :key="account.id"
          :account="account"
          :subtitle="accountSubtitle(account)"
        />
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>
<script setup lang="ts">
import { ACCOUNT_CATEGORIES_TRANSLATION_KEYS } from '@/common/const/account-categories-verbose';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/lib/ui/collapsible';
import GroupTotal from '@/components/sidebar/accounts-view/group-total.vue';
import { useBaseBalanceTotals } from '@/composable/use-base-balance-totals';
import type { ACCOUNT_CATEGORIES, AccountModel } from '@bt/shared/types';
import { ChevronRightIcon } from '@lucide/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccountsCategoryView } from '../use-accounts-category-view';
import { useAccountsSort } from '../use-accounts-sort';
import AccountListRow from './account-list-row.vue';

const props = defineProps<{
  category: ACCOUNT_CATEGORIES;
  accounts: AccountModel[];
  /** Account id → folder-group name, for the "in <group>" subtitle on account rows. */
  folderGroupNames: Record<string, string>;
}>();

const { t } = useI18n();
const { sortLeafAccounts } = useAccountsSort();
const { isCategoryOpen, setCategoryOpen } = useAccountsCategoryView();
const { baseCurrencyCode, sumBaseBalance } = useBaseBalanceTotals();

const isOpen = computed({
  get: () => isCategoryOpen({ category: props.category }),
  set: (open) => setCategoryOpen({ category: props.category, open }),
});

const sortedAccounts = computed(() => sortLeafAccounts(props.accounts));

// Same base-currency roll-up the folder rows and the overview card use (ref balances with
// the credit-limit adjustment), so mixed-currency accounts sum into one comparable figure.
const subtotal = computed(() => sumBaseBalance({ accounts: props.accounts }));

// The category is already the group header, so a row's subtitle only needs to surface the
// manual folder the account was flattened out of.
const accountSubtitle = (account: AccountModel): string | undefined => {
  const folderName = props.folderGroupNames[account.id];
  return folderName ? t('accounts.inGroupSubtitle', { name: folderName }) : undefined;
};
</script>
