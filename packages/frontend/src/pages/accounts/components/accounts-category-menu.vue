<template>
  <Popover.Popover :open="isOpen" @update:open="isOpen = $event">
    <Popover.PopoverTrigger as-child>
      <UiButton v-if="triggerVariant === 'labeled'" variant="outline">
        <LayersIcon class="size-4" />
        <span>{{ triggerLabel }}</span>
        <ChevronDownIcon class="size-4 opacity-60" />
      </UiButton>
      <UiButton v-else variant="outline" size="icon" :aria-label="$t('accounts.categoryView.ariaLabel')">
        <LayersIcon class="size-4" />
      </UiButton>
    </Popover.PopoverTrigger>
    <Popover.PopoverContent align="end" class="w-64 p-2">
      <label class="flex cursor-pointer items-center justify-between gap-3 px-2 py-1.5 text-sm">
        <span>{{ $t('accounts.categoryView.groupByCategory') }}</span>
        <Switch :model-value="isGroupedByCategory" @update:model-value="setGroupedByCategory({ value: !!$event })" />
      </label>
      <div class="border-border/60 my-2 border-t" />
      <div class="flex items-center justify-between px-2 pb-1">
        <span class="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
          {{ $t('accounts.categoryView.filterByCategory') }}
        </span>
        <UiButton v-if="categoryFilter.length" variant="link" size="sm" class="h-auto p-0" @click="clearCategoryFilter">
          {{ $t('accounts.categoryView.clear') }}
        </UiButton>
      </div>
      <label
        v-for="category in ACCOUNTS_FILTERABLE_CATEGORIES"
        :key="category"
        class="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm"
      >
        <Checkbox
          :model-value="categoryFilter.includes(category)"
          @update:model-value="toggleCategoryFilter({ category })"
        />
        {{ $t(ACCOUNT_CATEGORIES_TRANSLATION_KEYS[category]) }}
      </label>
    </Popover.PopoverContent>
  </Popover.Popover>
</template>
<script setup lang="ts">
import { ACCOUNT_CATEGORIES_TRANSLATION_KEYS } from '@/common/const/account-categories-verbose';
import UiButton from '@/components/lib/ui/button/Button.vue';
import { Checkbox } from '@/components/lib/ui/checkbox';
import * as Popover from '@/components/lib/ui/popover';
import { Switch } from '@/components/lib/ui/switch';
import { ChevronDownIcon, LayersIcon } from '@lucide/vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ACCOUNTS_FILTERABLE_CATEGORIES } from '../accounts-category-grouping';
import { useAccountsCategoryView } from '../use-accounts-category-view';

defineProps<{ triggerVariant: 'labeled' | 'icon' }>();

const { t } = useI18n();
const { isGroupedByCategory, categoryFilter, setGroupedByCategory, toggleCategoryFilter, clearCategoryFilter } =
  useAccountsCategoryView();

const isOpen = ref(false);

const triggerLabel = computed(() =>
  categoryFilter.value.length
    ? t('accounts.categoryView.labelWithFilter', { count: categoryFilter.value.length })
    : t('accounts.categoryView.label'),
);
</script>
