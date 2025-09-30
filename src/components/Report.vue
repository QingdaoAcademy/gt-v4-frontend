<script setup lang="ts">
import { ref } from 'vue';
import { useStore, sharedFunctions } from '../stores';
import { ReportContentTypeLabel } from '../consts/options';
import { Message } from '@arco-design/web-vue';
import { Axios, errorHandler } from '../axios';
const store = useStore();

const visible = ref(false),
  loading = ref(false);
const form = ref({
  content_id: '',
  content_type: '',
  explanation: '',
});

sharedFunctions.showReport = (content_id: number, content_type: string) => {
  if (!store.user) {
    Message.warning('请先登录');
    return;
  }
  form.value.content_id = content_id.toString();
  form.value.content_type = content_type;
  form.value.explanation = '';
  visible.value = true;
};

const handleOk = () => {
  loading.value = true;
  Axios.post('/report/', {
    content_id: form.value.content_id,
    content_type: form.value.content_type,
    explanation: form.value.explanation,
  })
    .then(() => {
      Message.success('提交成功');
      visible.value = false;
    })
    .catch(errorHandler)
    .finally(() => {
      loading.value = false;
    });
};
</script>

<template>
  <a-modal
    v-model:visible="visible"
    unmount-on-close
    title="申诉/举报"
    @ok="handleOk"
    :ok-loading="loading"
  >
    <a-typography-text style="font-size: 1.1em">
      我们会记录举报者用户信息，对及时反馈违规内容的用户给予一定奖励，同时对恶意举报者进行处罚。
    </a-typography-text>
    <a-form :model="form" style="margin-top: 1em" auto-label-width>
      <a-form-item label="内容类型">
        <a-input
          :model-value="ReportContentTypeLabel[form.content_type as keyof typeof ReportContentTypeLabel]"
          readonly
        />
      </a-form-item>
      <a-form-item field="content_id" label="内容ID">
        <a-input :model-value="form.content_id" readonly />
      </a-form-item>
      <a-form-item field="explanation" label="原因说明">
        <a-input
          v-model="form.explanation"
          :max-length="1000"
          :show-word-limit="false"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
