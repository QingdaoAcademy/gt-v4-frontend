<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Axios, errorHandler } from '../../axios';
import { formatTime } from '../../scripts/time';
import { CoinRecordTypeLabel } from '../../consts/options';
import UserPicker from '../../components/UserPicker.vue';
import { Message } from '@arco-design/web-vue';
import isMobile from '../../consts/isMobile';

const coinInfo = ref({ total: 0 } as any);
Axios.get('/coin/detail/')
  .then(res => {
    coinInfo.value = res.data;
  })
  .finally(() => {});

const coinRecordList = ref([] as string[]);
Axios.get('/coin/').then(res => {
  coinRecordList.value = res.data.data;
  if (coinRecordList.value.length > 0) {
    selectDate.value = coinRecordList.value[0];
    getData();
  }
});

const isDisabledDate = (current?: Date) => {
  if (!current) return false;
  const dateString = `${current.getFullYear()}-${(current.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
  return !coinRecordList.value.includes(dateString);
};

const selectDate = ref('');

const loadingList = ref(false),
  coin_record = ref([]),
  getData = () => {
    if (!selectDate.value) {
      coin_record.value = [];
      return;
    }
    loadingList.value = true;
    Axios.get(`/coin/${selectDate.value}/`)
      .then(res => {
        coin_record.value = res.data.records;
      })
      .catch(errorHandler)
      .finally(() => {
        loadingList.value = false;
      });
  };

const columns = [
  {
    title: '变化',
    dataIndex: 'change',
    render: ({ record }: { record: any }) => {
      return record.change >= 0 ? '+' + record.change : record.change;
    },
    width: isMobile ? 80 : undefined,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '类型',
    dataIndex: 'type',
    render: ({ record }: { record: any }) => {
      return CoinRecordTypeLabel[
        record.type as keyof typeof CoinRecordTypeLabel
      ];
    },
  },
  {
    title: '说明',
    dataIndex: 'detail',
    render: ({ record }: { record: any }) => {
      return record.detail || '-';
    },
  },
  {
    title: '时间',
    dataIndex: 'time',
    render: ({ record }: { record: any }) => {
      return formatTime(record.time);
    },
    width: isMobile ? 80 : undefined,
  },
];

const showPrecise = ref(false);

const transferForm = reactive({ to_user_id: undefined, amount: 1 }),
  transferLoading = ref(false),
  transferCoin = () => {
    transferLoading.value = true;
    Axios.post('/coin/transfer/', transferForm)
      .then(_res => {
        Message.success('转账成功');
        transferForm.to_user_id = undefined;
        transferForm.amount = 1;
      })
      .catch(errorHandler)
      .finally(() => {
        transferLoading.value = false;
      });
  };
</script>

<template>
  <a-layout style="padding-bottom: 2em">
    <a-statistic
      :value="coinInfo.total"
      :precision="showPrecise ? 6 : 2"
      @click="showPrecise = !showPrecise"
    >
      <template #title>
        <span style="font-size: 1.2em"> 当前硬币数量 </span>
      </template>
    </a-statistic>

    <a-divider />

    <a-typography-title :heading="5" style="margin: 0 0 1em 0">
      硬币明细
    </a-typography-title>
    <div style="margin-bottom: 1.2em">
      <a-date-picker
        disabled-input
        @change="getData"
        v-model="selectDate"
        :disabledDate="isDisabledDate"
      />
    </div>
    <a-table
      :columns="columns"
      :data="coin_record"
      row-key="id"
      :loading="loadingList"
      :pagination="false"
    />

    <a-divider style="margin: 2.5em 0" />

    <a-typography-title :heading="5" style="margin: 0 0 1em 0">
      新人任务
    </a-typography-title>
    <a-table
      :columns="[
        {
          title: '任务',
          dataIndex: 'title',
        },
        {
          title: '奖励',
          dataIndex: 'reward',
        },
        {
          title: '已完成',
          render: ({ record }) => (record.finished ? '是' : '否'),
        },
      ]"
      :data="[
        {
          title: '创建一个角色',
          reward: '+15',
          finished: coinInfo.role_create_reward,
        },
      ]"
      row-key="id"
      :loading="loadingList"
      :pagination="false"
    />

    <a-divider style="margin: 2.5em 0" />

    <a-typography-title :heading="5" style="margin: 0 0 1em 0">
      转账
    </a-typography-title>
    <a-typography-text style="font: 1.1em">
      你可以将硬币转账给其他用户。转账时瓜田将收取10%手续费。
    </a-typography-text>
    <a-form
      :model="transferForm"
      style="margin-top: 1em; max-width: 300px"
      auto-label-width
    >
      <a-form-item label="接收用户">
        <UserPicker v-model:user-id="transferForm.to_user_id" />
      </a-form-item>
      <a-form-item label="金额">
        <a-input-number
          mode="button"
          v-model="transferForm.amount"
          :min="1"
          :max="Math.floor(coinInfo)"
        />
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          @click="transferCoin"
          :loading="transferLoading"
        >
          转账
        </a-button>
      </a-form-item>
    </a-form>

    <a-divider style="margin: 2.5em 0" />

    <a-typography-title :heading="5" style="margin: 0 0 1em 0">
      相关说明
    </a-typography-title>
    <a-typography-text style="font: 1.1em">
      由于瓜田的硬币系统在部分场景通过单价*数量的方式计算扣费，因此硬币数量可能出现多位小数。实际处理过程中我们保证6位小数的精度。
      <br />
      为保证系统稳定性，实时硬币数量在极少数情况下可能与实际不符。实际信息以变动记录为准。每天凌晨系统会自动根据记录内容校正硬币数量。若对硬币数量有疑问，请务必在问题产生的24小时后至30日内联系管理员。
    </a-typography-text>
  </a-layout>
</template>
