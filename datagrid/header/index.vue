<template>
  <div class="b-table__header">
    <b-filters
      v-if="filters"
      ref="filters"
      :show="isFiltersShow"
      :filters="filters"
      :default="filtersDefault"
      @filtersChange="$emit('filtersChange', $event)"
      @activeChange="activeFiltersCount = $event"
      @close="isFiltersShow = false"
    />
    <el-button
      v-if="filters"
      type="info"
      size="small"
      :class="['l-py-4', 'l-pl-8']"
      :style="`padding-right: ${activeFiltersCount ? '4' : '16'}px`"
      @click="handleShowFilters"
    >
      <div class="b-table__header__filter">
        <el-badge
          :value="activeFiltersCount"
          :hidden="!activeFiltersCount"
          type="primary"
          class="b-table__header__badge"
        >
          <IconFunnel height="12" />
        </el-badge>
        <span>Фильтры</span>
        <button
          v-if="activeFiltersCount"
          class="b-table__header__clearButton"
          title="Очистить фильры"
          @click="handleClearFilters"
        />
      </div>
    </el-button>
    <div
      v-if="pagination"
      class="d-flex l-ml-auto"
    >
      <transition
        name="fade"
        appear
      >
        <el-pagination
          :total="pagination.total"
          :current-page="pagination.page + 1"
          :page-size="pagination.size"
          small
          :page-sizes="[10, 25, 50, 100]"
          :layout="pagination.total > 10 ? 'slot, sizes, prev, pager, next' : 'slot'"
          @current-change="$emit('changePage', $event)"
          @size-change="$emit('changePaginationSize', $event)"
        >
          <p
            slot
            class="color--gray-1"
          >
            Всего найдено:
            <span
              class="l-px-6"
              v-text="pagination.total.toLocaleString()"
            />
          </p>
        </el-pagination>
      </transition>
      <el-button
        type="info"
        size="small"
        native-type="button"
        icon="el-icon-setting"
        class="l-ml-16"
        @click="$emit('openTableSettings')"
      >
        Настройки
      </el-button>
    </div>
  </div>
</template>

<script>
import IconFunnel from '@icons/funnel.svg';

export default {
  name: 'TableHeader',
  components: {
    IconFunnel,
    BFilters: () => import(/* webpackChunkName: "components/table/filters" */ './filter')
  },
  props: {
    pagination: { type: Object, default: null },
    filters: { type: Array, default: null },
    filtersDefault: { type: Array, default: () => ([]) }
  },
  data: () => ({
    isFiltersShow: false,
    activeFiltersCount: 0
  }),
  methods: {
    handleShowFilters () {
      this.isFiltersShow = true;
    },
    handleClearFilters (e) {
      e.stopPropagation(e);
      this.$refs.filters.handlerClearFilter();
      this.$refs.filters.submitFilters();
    }
  }
};
</script>

<style lang="scss">
  .b-table__header {
    display: flex;
    background: $--color-gray-06;
    border-bottom: 1px solid $--color-gray-04;
    border-radius: 4px 4px 0 0;
    padding: 10px;

    &__item {
    }

    &__badge {
      padding-right: 4px;
      margin-right: 12px;

      .el-badge__content {
        color: white;
        font-size: 11px;
        height: 16px;
        line-height: 16px;
        padding: 0 5px;
      }
    }

    &__clearButton {
      display: flex;
      position: relative;
      justify-content: center;
      align-items: center;
      height: 18px;
      width: 18px;
      margin-left: 12px;
      margin-right: 2px;
      border-radius: 50%;
      background: transparent;
      border: 0;
      cursor: pointer;

      &:before, &:after {
        content: '';
        position: absolute;
        width: 12px;
        height: 2px;
        background: white;
      }

      &:before {
        transform: rotate(45deg);
      }

      &:after {
        transform: rotate(-45deg);
      }

      &:hover {
        background: $--color-gray-02;
      }
    }

    &__filter {
      display: flex;
      align-items: center;
    }

    & + .el-table--border {
      border-radius: 0;
    }
  }
</style>
