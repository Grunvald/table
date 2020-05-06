const orders = {
  descending: 'DESC',
  ascending: 'ASC'
};

export default {
  state: {
    pagination: {
      page: 0,
      size: 10,
      total: 0
    },
    activeFilters: [],
    sortItems: []
  },
  getters: {
    pagination: (state) => state.pagination,
    activeFilters: (state) => state.activeFilters,
    activeSort: (state) => getActiveSort(state.sortItems),
    sortItems: (state) => getSort(state.sortItems),
    tableModel: (state, getters) => ({
      page: state.pagination.page,
      size: state.pagination.size,
      filter: getters.activeFilters,
      sort: (state.filters && state.filters.settings && state.filters.settings.sortable === 'false') ? undefined : getters.activeSort
    })
  },
  mutations: {
    setPage (state, payload) {
      state.pagination.page = payload;
    },
    setPageSize (state, payload) {
      state.pagination.page = 0;
      state.pagination.size = payload;
    },
    setTotal (state, payload) {
      state.pagination.total = payload;
    }
  },
  actions: {
    filterChanged: ({ state, dispatch }, payload) => {
      state.activeFilters = Object.values(payload.data)
        .map(el => {
          if (el.type === 'date') {
            el.startValue = Date.parse(el.startValue)
              .toString();
            el.endValue && (el.endValue = Date.parse(el.endValue)
              .toString());
          }
          const { field, parameter, startValue, endValue } = el;
          return { field, parameter, startValue, endValue };
        });
      state.pagination.page = 0;
      typeof payload.getData === 'string' ? dispatch(payload.getData) : payload.getData();
    },
    sortChanged: ({ state, dispatch }, payload) => {
      state.sortItems = payload.data ? handlerSortChange(state.sortItems, payload.data) : [];
      payload.getData();
    },
    tableReset ({ state, dispatch }, isRefreshData = false) {
      state.pagination.page = 0;
      state.pagination.size = 10;
      state.sortItems = [];
      state.activeFilters = [];
      isRefreshData && dispatch('getData');
    }
  }
};

function getSort (arr) {
  return arr.reduce((acc, el, index) => {
    acc[el.prop] = { order: el.order, index: index };
    return { ...acc };
  }, {});
}

function getActiveSort (arr) {
  return arr.map(el => ({ field: el.prop, parameter: orders[el.order] }));
}

/*function getActiveFilter(obj) {
 const res = {};
 Object.keys(obj).forEach(el => {
 if (el === 'start_date') {
 if (obj.start_date) {
 res.start_date = res.end_date = `${obj.start_date.getFullYear()}-${obj.start_date.getMonth() + 1}-${obj.start_date.getDate()}`;
 }
 } else if (obj[el] instanceof Date) {
 res[el] = `${obj[el].getFullYear()}-${obj[el].getMonth() + 1}-${obj[el].getDate()}`;
 } else {
 res[el] = obj[el]
 }
 });
 return res;
 }*/

function handlerSortChange (sort, payload) {
  const prop = sort.length ? sort.find(el => el.prop === payload.prop) : null;
  prop ? prop.order = prop.order === 'descending' ? null : 'descending' : sort.push(payload);
  return sort.filter(el => el.order);
}

function parseFiltersValue (el) {
  if (el.unique) {
    return [];
  } else if (Array.isArray(el.values) && el.values.length && typeof el.values[0] === 'object') {
    return el.values;
  } else if (typeof el.values === 'object' && !Array.isArray(el.values)) {
    return Object.keys(el.values)
      .map(item => ({ value: item, label: el.values[item] }));
  } else {
    return el.values.map(item => ({ value: item, label: item }))
  }
}

function getType (el) {
  let type
  if (!el.unique) {
    type = 'list'
  } else if (el.type === 'long') {
    if (~el.field.toLowerCase().indexOf('time') || ~el.field.toLowerCase().indexOf('date')) {
      type = 'date'
    } else {
      type = 'string'
    }
  } else if (el.type === 'int'){
    type = 'number'
  } else {
    type = 'string'
  }
  return type
}

export const parseFilters = (arr) => arr.map(el => ({
  ...el,
  type: getType(el),
  // values: el.unique ? [] : el.values.map(el => ({ value: el, label: el })),
  values: parseFiltersValue(el),
  fieldOptions: el.type === 'long' ? {
    firstDayOfWeek: 1,
    disabledDate: (time) => time.getTime() > Date.now()
  } : undefined
}));
