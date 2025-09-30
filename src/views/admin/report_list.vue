<script setup lang="ts">
import { ref } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { ReportStatusOptions } from '../../consts/options';
import DataTable from '../../components/DataTable.vue';

const reportStatus = ref(0),
  loadingReportList = ref(false),
  reportList = ref([]),
  reportPagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
  }),
  getReportList = () => {
    loadingReportList.value = true;
    Axios.get('/report/', {
      params: {
        status: reportStatus.value,
        page: reportPagination.value.current,
        page_size: reportPagination.value.pageSize,
      },
    })
      .then(res => {
        reportList.value = res.data.results;
        reportPagination.value.total = res.data.count;
      })
      .catch(errorHandler)
      .finally(() => {
        loadingReportList.value = false;
      });
  };

getReportList();
</script>

<template>
  <div>
    <a-radio-group
      style="margin: 1em 0"
      :options="ReportStatusOptions"
      v-model:model-value="reportStatus"
      @change="getReportList"
    />
    <DataTable
      :data="reportList"
      :loading="loadingReportList"
      :pagination="reportPagination"
      type="report"
      @change="(page:number) => {
        reportPagination.current = page;
        getReportList();
      }"
    />
  </div>
</template>

<style lang="scss" scoped>
.arco-form-item {
  justify-content: center;
}
</style>
