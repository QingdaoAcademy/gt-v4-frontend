<script setup lang="ts">
import { ref, h, reactive } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { Image } from '@arco-design/web-vue';
import { ImageSceneLabel, ImageSceneOptions } from '../../consts/options';
import { formatDatetime } from '../../scripts/time';
import { formatSize } from '../../scripts/format';

const filter = reactive({
  search: '',
  scene: '',
});

const loadingList = ref(false),
  data = ref([]),
  pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
  }),
  getData = () => {
    loadingList.value = true;
    Axios.get('/image/', {
      params: {
        ...filter,
        page: pagination.value.current,
        page_size: pagination.value.pageSize,
      },
    })
      .then(res => {
        data.value = res.data.results;
        pagination.value.total = res.data.count;
      })
      .catch(errorHandler)
      .finally(() => {
        loadingList.value = false;
      });
  };
getData();

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '文件名',
    dataIndex: 'name',
  },
  {
    title: '用户',
    dataIndex: 'user',
    render: ({ record }: { record: any }) => {
      return `${record.user.real_name}(${record.user.username})`;
    },
  },
];

const descriptionData = (record: any) => {
  return [
    {
      label: 'ID',
      value: record.id,
    },
    {
      label: '文件名',
      value: record.name,
    },
    {
      label: 'MD5',
      value: record.md5,
    },
    {
      label: '场景',
      value: ImageSceneLabel[record.scene],
    },
    {
      label: '文件大小',
      value: formatSize(record.size),
    },
    {
      label: '上传时间',
      value: formatDatetime(record.create_time),
    },
    {
      label: '已被禁用',
      value: record.is_banned ? '是' : '否',
    },
    {
      label: '预览',
      value: () =>
        h(
          Image,
          {
            src: `https://image.qaguatian.com/${record.key}/webp`,
            width: 200,
          },
          '预览'
        ),
    },
  ];
};
</script>

<template>
  <a-space wrap style="margin-bottom: 1em">
    <a-input
      v-model="filter.search"
      placeholder="请输入用户"
      class="mb-1"
      style="max-width: 300px; margin: 0"
      @keydown.enter="
        pagination.current = 1;
        getData();
      "
    />
    <a-select
      v-model="filter.scene"
      placeholder="请选择场景"
      :options="ImageSceneOptions"
      allow-clear
      class="mb-1"
      style="max-width: 300px; margin: 0"
      @keydown.enter="
        pagination.current = 1;
        getData();
      "
    />
    <a-button type="primary" @click="getData" style="margin: 0">
      <template #icon>
        <IconSearch />
      </template>
    </a-button>
  </a-space>

  <a-table
    :columns="columns"
    :data="data"
    :expandable="{}"
    :pagination="pagination"
    row-key="id"
    :loading="loadingList"
    @page-change="(page:number) => {
        pagination.current = page;
        getData();
      }"
  >
    <template #expand-row="{ record }">
      <a-descriptions
        style="margin-top: 5px"
        :data="descriptionData(record)"
        size="medium"
        :column="1"
      />
    </template>
  </a-table>
</template>

<style lang="scss" scoped>
.arco-form-item {
  justify-content: center;
}
</style>
