<script setup lang="ts">
import { reactive, ref } from 'vue';
import { isMobile } from '../consts/isMobile';
import { Axios, errorHandler } from '../axios';
import { Message } from '@arco-design/web-vue';
import { saveUserInfo } from '../scripts/userInfo';

const form = reactive({
  email: '',
});

const form2 = reactive({
  code: '',
});

const step = ref(1);

const emailLoading = ref(false),
  submit = ({ values, errors }: { values: any; errors: any }) => {
    if (errors) {
      return;
    }
    emailLoading.value = true;
    Axios.post('/user/email_sendcode/', {
      email: values.email,
    })
      .then(_res => {
        Message.success('已获取验证码');
        step.value++;
      })
      .catch(errorHandler)
      .finally(() => {
        emailLoading.value = false;
      });
  };

const codeLoading = ref(false),
  submit2 = ({ values, errors }: { values: any; errors: any }) => {
    if (errors) {
      return;
    }
    codeLoading.value = true;
    Axios.post('/user/email_verifycode/', {
      code: values.code,
    })
      .then(res => {
        saveUserInfo(res.data, true, true);
        step.value++;
      })
      .catch(errorHandler)
      .finally(() => {
        codeLoading.value = false;
      });
  };
</script>

<template>
  <div class="card-container">
    <a-card>
      <a-typography-title :heading="2"> 绑定邮箱 </a-typography-title>

      <a-divider class="divider-30" />

      <a-steps
        :current="step"
        style="margin-bottom: 50px"
        :direction="isMobile ? 'vertical' : 'horizontal'"
      >
        <a-step> 新邮箱填写 </a-step>
        <a-step> 填写验证码 </a-step>
        <a-step> 完成绑定 </a-step>
      </a-steps>

      <a-form
        :model="form"
        layout="vertical"
        v-if="step === 1"
        @submit="submit"
      >
        <a-form-item
          field="email"
          label="邮箱账号"
          :rules="[{ required: true, message: '请输入邮箱' }]"
          :validate-trigger="['change', 'input']"
          asterisk-position="end"
        >
          <a-input v-model="form.email" placeholder="请输入你的邮箱" />
        </a-form-item>
        <a-form-item>
          <a-space size="medium">
            <a-button type="primary" html-type="submit" :loading="emailLoading">
              开始绑定
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <div v-if="step === 2">
        <a-form :model="form2" @submit="submit2">
          <a-form-item
            field="code"
            label="验证码"
            :rules="[
              { required: true, message: '请输入验证码' },
              { minLength: 6, message: '验证码格式错误' },
              { match: /^\d+$/, message: '验证码格式错误' },
            ]"
          >
            <a-verification-code
              v-model="form2.code"
              :formatter="
                inputValue => (/^\d*$/.test(inputValue) ? inputValue : false)
              "
            />
          </a-form-item>

          <a-divider style="margin-bottom: 3em" />
          <a-button type="primary" htmlType="submit"> 下一步 </a-button>
        </a-form>
      </div>

      <a-result
        status="success"
        title="您已成功绑定邮箱"
        subtitle="您现在可以使用邮箱的相关功能了"
        v-if="step === 3"
      >
        <template #extra>
          <a-space>
            <RouterLink :to="{ name: 'settings' }">
              <a-button> 回到设置 </a-button>
            </RouterLink>
          </a-space>
        </template>
      </a-result>
    </a-card>
  </div>
</template>
