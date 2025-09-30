export const _writeToQuery = (search: any, pagination: any, router: any) => {
  const route = router.currentRoute.value;
  const __writeToQuery = (resetPage: boolean = false) => {
    const query = structuredClone(route.query);

    for (const key in search) {
      if (search[key] || query[key]) {
        let val = search[key];
        if (typeof val === 'number') {
          val = String(val);
        } else if (Array.isArray(val)) {
          val = val.join(',');
        }
        if ((val || query[key]) && val !== query[key]) {
          query[key] = val;
        }
      }
    }

    if (resetPage) pagination.page = 1;
    for (const key of ['page', 'pageSize']) {
      if (pagination[key] || query[key]) query[key] = pagination[key];
    }

    for (const key in query) {
      if (!query[key]) delete query[key];
    }

    router.replace({ query });
  };
  return __writeToQuery;
};
