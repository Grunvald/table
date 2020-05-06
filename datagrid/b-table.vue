<template>
  <div
    :key="'header' + filteredColList.toString()"
    class="b-table"
  >
    <el-dialog
      title="Настройка отображения колонок"
      :visible.sync="isTableSettingsShow"
      width="30%"
      class="b-table-settings"
    >
      <div class="b-table-settings__label">
        <p>Название колонки</p>
      </div>
      <el-checkbox-group
        v-model="filteredColList"
        @change="handlerColFilterChange"
        class="b-table-settings__group"
      >
        <template v-for="(value, key) in colList">
          <div
            :key="key"
            v-if="value.name && value.index > 0"
            class="b-table-settings__item"
          >
            <el-checkbox
              :label="key"
              size="medium"
            >
              {{ value.name }}
            </el-checkbox>
          </div>
        </template>
      </el-checkbox-group>
    </el-dialog>
    <b-table-header
      :filters="filters"
      :filtersDefault="filtersDefault"
      :pagination="pagination"
      :activeFilters="activeFiltersCount"
      @changePage="handlerChangePage"
      @changePaginationSize="handlerChangePaginationSize"
      @showFilters="isFiltersShow = true"
      @filtersChange="handleFiltersChange"
      @openTableSettings="isTableSettingsShow = true"
    >

    </b-table-header>
    <el-table
      :key="filteredColList.toString()"
      v-loading="isProcessing && loading"
      :data="data"
      size="small"
      border
      :row-class-name="rowClassName"
      :header-cell-class-name="checkActiveSort"
      @sort-change="handleSortChanged"
      @expand-change="$emit('expand-change', $event)"
    >
      <span slot="empty">По вашему запросу ничего не найдено</span>
      <slot />
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BTableHeader from './header';

export default {
  name: 'Table',
  components: {
    BTableHeader
  },
  props: {
    rowClassName: { type: Function, default: null },
    name: { type: String, default: null },
    data: { type: Array, default: () => ([]) },
    sortChange: { type: Function, default: () => null },
    sort: { type: Object, default: () => ({}) },
    pagination: { type: Object, default: null },
    getData: { type: Function, default: null },
    filters: {
      default: null,
      validator: prop => (Array.isArray(prop)) || prop === null
    },
    filtersChange: { type: Function, default: () => null },
    filtersDefault: { type: Array, default: () => ([]) },
    loading: { type: Boolean, default: true }
  },
  data: () => ({
    filteredColList: [],
    colList: [],
    nodes: [],
    isTableSettingsShow: false,
    isFiltersShow: false,
    activeFiltersCount: 0
  }),
  computed: {
    ...mapGetters([
      'isProcessing'
    ]),
    storageKey () {
      return `zia2_${this.$store.getters.userLogin}_${this.name || this.$route.path.split('/')
        .join('')}_cols`;
    }
  },
  watch: {
    storageKey () {
      this.updateFilteredColList();
      this.handlerFilterCol();
    }
  },
  mounted () {
    this.colList = this.$slots.default.filter((el) => el.componentOptions && el.componentOptions.tag === 'el-table-column');
    this.colList = this.colList.reduce((res, el, index) => {
      res[el.componentOptions.propsData.prop] = { name: el.componentOptions.propsData.label, index: index };
      return { ...res };
    }, {});
    this.updateFilteredColList();
    this.nodes = this.$slots.default.filter(el => el.componentOptions && el.componentOptions.tag === 'el-table-column');
    this.handlerFilterCol();
    if (!this.filtersDefault.length) this.handlerGetData();
  },
  beforeUpdate () {
    this.handlerFilterCol();
  },
  methods: {
    handlerGetData () {
      this.getData ? this.getData() : this.$emit('getData');
    },
    handlerChangePage (val) {
      this.pagination.page = val - 1;
      this.handlerGetData();
    },
    handlerChangePaginationSize (val) {
      this.pagination.page = 0;
      this.pagination.size = val;
      this.handlerGetData();
    },
    handlerFilterCol () {
      this.$slots.default = this.nodes.filter(el => this.filteredColList.includes(el.componentOptions.propsData.prop) || el.componentOptions.propsData.type === 'index');
    },
    handlerColFilterChange () {
      if (this.storageKey) JSON.stringify(window.localStorage.setItem(this.storageKey, this.filteredColList));
      this.handlerFilterCol();
    },
    updateFilteredColList () {
      this.filteredColList = this.storageKey ? (window.localStorage.getItem(this.storageKey) && window.localStorage.getItem(this.storageKey)
        .split(',')) || Object.keys(this.colList) : Object.keys(this.colList);
    },
    checkActiveSort (data) {
      const prop = data.column.property;
      let res = '';
      if (this.sort[prop]) {
        res += this.sort[prop].order ? this.sort[prop].order === 'descending' ? 'DESC' : 'ASC' : '';
        if (Object.keys(this.sort).length > 1) res += ` i${this.sort[prop].index + 1}`;
      }
      return res;
    },
    handleSortChanged (data) {
      this.sortChange({ data: data, getData: this.getData });
    },
    handleFiltersChange (data) {
      this.filtersChange({ data: data, getData: this.getData });
    }
  }
};
</script>
<style lang="scss">
  .b-table {
    display: flex;
    flex-direction: column;
    position: relative;

    &-settings {
      &__label {
        padding: 0 0 0 24px;
        margin-bottom: 4px;
        color: $--color-gray-01;
        font-size: 13px;
        border-bottom: 1px solid $--color-gray-03;
      }

      &__group {
        margin-top: 14px;
      }

      &__item {
        margin-bottom: 12px;

        .el-checkbox__label {
          font-size: 15px;
        }

        .el-checkbox__input + .el-checkbox__label {
          color: $--color-gray-01;
        }

        .el-checkbox__input.is-checked + .el-checkbox__label {
          color: white;
        }

        .el-checkbox__input.is-checked .el-checkbox__inner {
          border-color: $--color-gray-01;
          background: $--color-gray-02;

          &:after {
            border-color: white;
          }
        }

        .el-checkbox__input.is-focus .el-checkbox__inner {
          border-color: $--color-gray-01;
        }
      }
    }
  }
</style>
