<template>
  <el-dialog
    :visible="show"
    class="filters"
    @close="$emit('close')"
  >
    <h2
      slot="title"
      class="filters__header"
    >
      Фильтры
    </h2>
    <div class="filters__items">
      <template v-for="(item, key) in filters">
        <el-checkbox
          v-if="activeFilters[item.field]"
          :key="item.fieldName + key + 'check'"
          v-model="activeFilters[item.field].state"
          :title="item.fieldName"
        >
          {{ item.fieldName }}
        </el-checkbox>
        <component
          :is="item.type"
          :key="item.fieldName + key + 'component'"
          width="24"
          height="24"
          class="filters__items-icon"
        />
        <el-select
          v-if="activeFilters[item.field]"
          :key="item.fieldName + key + 'select'"
          v-model="activeFilters[item.field].parameter"
          size="mini"
          :class="{'disabled' : filters.settings && filters.settings.parameters === 'false'}"
          placeholder="Выберите условие"
          @change="item.type === 'date' && handlerDateCondChange(activeFilters[item.field], item.field)"
        >
          <el-option
            v-for="(el, i) in cond[item.type]"
            :key="i"
            :value="el[0]"
            :label="el[2]"
          >
            <span
              class="l-pr-4"
              v-text="el[0]"
            />
            <span v-text="el[2]" />
          </el-option>
        </el-select>
        <template v-if="item.type === 'list'">
          <el-select
            v-if="activeFilters[item.field]"
            :key="item.fieldName + key + item.type"
            v-model="activeFilters[item.field].startValue"
            size="mini"
            placeholder="Выберите значение"
            @change="handleCheckState($event, activeFilters[item.field])"
          >
            <el-option
              v-for="(val, i) in item.values"
              :key="val.value + i"
              :label="val.label"
              :value="val.value"
            />
          </el-select>
        </template>
        <template v-else-if="item.type === 'date'">
          <el-date-picker
            v-if="activeFilters[item.field]"
            :key="item.fieldName + key + item.type + 'startValue'"
            v-model="tempDate[item.field][activeFilters[item.field].parameter === cond.date[6][0] || activeFilters[item.field].parameter === cond.date[7][0] ? 'rangeValue' : 'value']"
            :type="activeFilters[item.field].parameter === cond.date[6][0] || activeFilters[item.field].parameter === cond.date[7][0] ? 'daterange' : 'date'"
            size="mini"
            class="w-100"
            placeholder="Выберите значение"
            :picker-options="datePickerOptions"
            @change="handlerDateChange($event, activeFilters[item.field])"
          />
        </template>
        <template v-else>
          <el-input
            v-if="activeFilters[item.field] && (activeFilters[item.field].parameter !== cond.date[6][0]) && (activeFilters[item.field].parameter !== cond.date[7][0])"
            :key="item.fieldName + key + item.type"
            v-model="activeFilters[item.field].startValue"
            placeholder="Введите значение"
            size="mini"
            @input="handleCheckState($event, activeFilters[item.field])"
          />
          <template v-else>
            <div
              :key="'input'+item.type+'multi'"
              class="d-flex align-items-center"
            >
              <span class="flex-none l-pr-8">от</span>
              <el-input
                v-if="activeFilters[item.field]"
                :key="'input'+item.type"
                v-model="activeFilters[item.field].startValue"
                placeholder="Введите значение"
                size="mini"
              />
              <span class="flex-none l-px-8">до</span>
              <el-input
                v-if="activeFilters[item.field]"
                :key="'input'+item.type"
                v-model="activeFilters[item.field].endValue"
                placeholder="Введите значение"
                size="mini"
              />
            </div>
          </template>
        </template>
      </template>
      <!--      <pre v-text="activeFilters"></pre>-->
    </div>
    <div
      slot="footer"
      class="filters__footer"
    >
      <el-button
        type="text"
        class="l-mr-auto"
        @click="handlerClearFilter"
      >
        Сбросить все фильтры
      </el-button>
      <el-button
        type="info"
        @click="$emit('close')"
      >
        Отменить
      </el-button>
      <el-button
        type="primary"
        @click="submitFilters"
      >
        Применить
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { conditions } from '@/constants';

export default {
  name: 'TableFilters',
  components: {
    string: () => import(/* webpackChunkName: "icons" */ '@icons/filter_string.svg'),
    number: () => import(/* webpackChunkName: "icons" */ '@icons/filter_number.svg'),
    list: () => import(/* webpackChunkName: "icons" */ '@icons/filter_list.svg'),
    date: () => import(/* webpackChunkName: "icons" */ '@icons/calendar-3_icon.svg')
  },
  props: {
    filters: { type: Array, default: () => ([]) },
    show: { type: Boolean, default: false },
    default: { type: Array, default: () => ([]) }
  },
  data: () => ({
    conditions,
    activeFilters: {},
    activeFiltersCount: 0,
    ignoreDefault: false,
    tempDate: {},
    tempInput: {},
    datePickerOptions: {
      firstDayOfWeek: 1,
      disabledDate: (time) => time.getTime() > Date.now()
    }
  }),
  computed: {
    cond () {
      return {
        number: this.conditions,
        date: this.conditions,
        list: [this.conditions[0], this.conditions[1]],
        string: [this.conditions[0], this.conditions[1]]
      };
    }
  },
  methods: {
    filtersInit () {
      const defaultFiltersName = this.ignoreDefault ? [] : this.default.map(({ field }) => field);
      const getActiveFilter = (item) => {
        const activeItem = this.ignoreDefault ? null : this.default.find(({ field }) => field === item.field)
        const filterItem = {
          field: item.field,
          state: !!activeItem,
          parameter: (this.filters.settings && this.filters.settings.parameters === 'false') ? '=' : undefined
        }
        if (defaultFiltersName.includes(item.field)) {
          filterItem.parameter = activeItem.parameter || '='
          filterItem.startValue = activeItem.startValue
        }
        return filterItem
      }
      this.filters.forEach(el => {
        this.$set(this.activeFilters, el.field, getActiveFilter(el));
        this.$set(this.tempDate, el.field, {});
        this.$set(this.tempInput, el.field, {});
      });
      this.submitFilters()
    },
    handlerDateCondChange (el, key) {
      this.tempDate[key] = {};
      delete el.startValue;
      delete el.endValue;
    },
    handlerDateChange (value, item) {
      if (Array.isArray(value)) {
        this.$set(item, 'startValue', value[0]);
        this.$set(item, 'endValue', value[1]);
      } else {
        this.$set(item, 'startValue', value);
        delete item.endValue;
      }
      this.handleCheckState(value, item);
    },
    handleCheckState (value, item) {
      item.state = !!value;
      if (!item.parameter) this.$set(item, 'parameter', '=');
    },
    handlerClearFilter () {
      this.ignoreDefault = true;
      this.filtersInit();
    },
    submitFilters () {
      const items = Object.keys(this.activeFilters)
        .filter(el => this.activeFilters[el] && this.activeFilters[el].state)
        .reduce((res, item, index) => {
          return (this.activeFilters[item] && this.activeFilters[item].startValue && this.activeFilters[item].state) ? {
            ...res,
            [item]: { ...this.activeFilters[item], type: this.filters[index].type }
          } : { ...res };
        }, {});
      this.$emit('filtersChange', items);
      this.$emit('close');
      this.$emit('activeChange', this.countActiveFilters());
    },
    countActiveFilters () {
      return Object.keys(this.activeFilters)
        .filter(el => this.activeFilters[el] && this.activeFilters[el].state && this.activeFilters[el].startValue).length;
    }
  },
  watch: {
    activeFilters: {
      handler: function () {
        this.activeFiltersCount = this.countActiveFilters();
      },
      immediate: true,
      deep: true
    },
    filters: {
      handler: function () {
        this.filtersInit();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style
  lang="scss"
  src="./_b-filters.scss"
/>
