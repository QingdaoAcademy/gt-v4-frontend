<script setup lang="ts">
import { reactive, ref } from 'vue';
import { isMobile } from '../consts/isMobile';
import PrivacySetting from './settings/Privacy.vue';
import RoleSetting from './settings/Role.vue';
import { Axios, errorHandler } from '../axios';
import { Message } from '@arco-design/web-vue';
import { saveUserInfo } from '../scripts/userInfo';
import { useRoute } from 'vue-router';
import Hccaptcha from '../components/Hccaptcha.vue';
import { School, SchoolOptions } from '../consts/options';

const route = useRoute();

const form = reactive({
  username: '',
  yunxiao_username: '',
  password: '',
  invite_username: '',
  school: School.qdzx,
  disable_invite_input: false,
  isRead: false,
  captcha_token: '',
});
const visible = reactive([false, false]);
const step = ref(1);

if (route.query.invite_username) {
  form.invite_username = route.query.invite_username as string;
  form.disable_invite_input = true;
}

const registerLoading = ref(false),
  register = ({ values, errors }: { values: any; errors: any }) => {
    if (errors) {
      return;
    } else if (form.captcha_token === '') {
      Message.warning('请完成人机验证');
      return;
    }
    registerLoading.value = true;
    Axios.post('/user/register-with-yunxiao/', {
      username: values.username,
      yunxiao_username: values.yunxiao_username,
      password: values.password,
      school: values.school,
      invite_username: values.invite_username,
      captcha_token: values.captcha_token,
    })
      .then(res => {
        saveUserInfo(res.data, true, false);
        Message.success('注册成功');
        step.value++;
      })
      .catch(err => {
        form.captcha_token = '';
        errorHandler(err);
      })
      .finally(() => {
        registerLoading.value = false;
      });
  };
</script>

<template>
  <div class="card-container">
    <a-card>
      <a-typography-title :heading="2"> 爱云校注册 </a-typography-title>

      <a-divider class="divider-30" />

      <a-steps
        :current="step"
        style="margin-bottom: 50px"
        :direction="isMobile ? 'vertical' : 'horizontal'"
      >
        <a-step> 身份验证 </a-step>
        <a-step> 隐私设置 </a-step>
        <a-step> 角色设置 </a-step>
      </a-steps>

      <a-form
        :model="form"
        layout="vertical"
        v-if="step === 1"
        @submit="register"
      >
        <a-alert style="margin-bottom: 1em" type="warning">
          我们不会记录和泄露你提供的密码信息，但为了不必要的麻烦，建议你使用其它方式注册。
        </a-alert>
        <a-alert style="margin-bottom: 1em">
          此页面填写的瓜田账号和爱云校密码将作为你登录QA瓜田的初始凭据，请妥善保管。
        </a-alert>
        <a-alert style="margin-bottom: 1em">
          若提示“验证码错误”，请检查密码是否输入正确并重新提交注册。
        </a-alert>
        <a-form-item
          field="username"
          label="瓜田账号"
          :rules="[{ required: true, message: '请设置瓜田账号' }]"
          :validate-trigger="['change', 'input']"
          asterisk-position="end"
          tooltip="瓜田账号仅用于登录，与发帖等无关"
        >
          <a-input v-model="form.username" placeholder="请设置你的瓜田账号" />
        </a-form-item>
        <a-form-item
          field="yunxiao_username"
          label="爱云校账号"
          :rules="[{ required: true, message: '请输入爱云校账号' }]"
          :validate-trigger="['change', 'input']"
          asterisk-position="end"
        >
          <a-input
            v-model="form.yunxiao_username"
            placeholder="请输入你的爱云校账号"
          />
        </a-form-item>
        <a-form-item
          field="password"
          label="爱云校密码"
          :rules="[{ required: true, message: '请输入爱云校密码' }]"
          :validate-trigger="['change', 'input']"
          asterisk-position="end"
        >
          <a-input-password
            v-model="form.password"
            placeholder="请输入你的爱云校密码"
          />
        </a-form-item>
        <a-form-item field="school" label="学校">
          <a-select v-model="form.school" :options="SchoolOptions" />
        </a-form-item>
        <a-form-item
          field="invite_user"
          label="邀请用户"
          tooltip="账号为邀请者注册时填写的爱云校账号信息，可在“设置”中查看"
          :disabled="form.disable_invite_input"
        >
          <a-input
            v-model="form.invite_username"
            placeholder="请输入邀请用户的账号"
          />
        </a-form-item>
        <a-form-item
          field="isRead"
          :rules="[
            { type: 'boolean', true: true, message: '请同意信息处理声明' },
          ]"
        >
          <a-checkbox v-model="form.isRead"> 我了解并同意 </a-checkbox>
          <a-link @click="visible[0] = true"> QA瓜田信息处理声明 </a-link>
        </a-form-item>
        <Hccaptcha
          v-model:token="form.captcha_token"
          style="margin-bottom: 1em"
        />
        <a-form-item>
          <a-space size="medium">
            <a-button
              type="primary"
              html-type="submit"
              :loading="registerLoading"
            >
              注册
            </a-button>
            <RouterLink :to="{ name: 'register' }">
              <a-link> 我不愿意提供以上信息 </a-link>
            </RouterLink>
          </a-space>
        </a-form-item>
      </a-form>

      <div v-if="step === 2">
        <PrivacySetting />
        <a-divider style="margin-bottom: 3em" />
        <a-button
          type="primary"
          @click="step++"
          style="float: inline-end; margin-bottom: 1.5em"
        >
          下一步
        </a-button>
      </div>

      <div v-if="step === 3">
        <RoleSetting />
        <a-divider style="margin-bottom: 3em" />
        <a-button
          type="primary"
          @click="step++"
          style="float: inline-end; margin-bottom: 1.5em"
        >
          下一步
        </a-button>
      </div>

      <a-result
        status="success"
        title="您已完成注册"
        subtitle="您现在可以开始探索QA瓜田，或前往设置界面解锁更多功能"
        v-if="step === 4"
      >
        <template #extra>
          <a-space>
            <RouterLink :to="{ name: 'index' }">
              <a-button> 前往首页 </a-button>
            </RouterLink>
            <RouterLink :to="{ name: 'settings' }">
              <a-button type="primary"> 更多设置 </a-button>
            </RouterLink>
          </a-space>
        </template>
      </a-result>
    </a-card>
  </div>

  <a-modal
    v-model:visible="visible[0]"
    @ok="
      visible[0] = false;
      form.isRead = true;
    "
    hide-cancel
    ok-text="同意"
  >
    <template #title> QA瓜田信息处理声明 </template>
    <div>
      为验证注册用户身份为青岛中学学生、教师或其他我们服务的对象，以及根据身份对用户权限进行限制（如设置帖子可见范围），我们要求自助注册的用户提供爱云校账号和密码。
      <br />
      在此页面单击“注册”，我们会利用你提供的爱云校账号和密码进行一次模拟登录以验证信息的正确性。若模拟登录成功，我们将会通过爱云校收集你的部分信息，包括且仅限于学号、姓名、性别、身份信息（学生、教师或家长）、爱云校生成的唯一学生标识；与此同时，我们会对你提供的密码进行多轮加盐SHA256加密并保存在数据库中，以作为你登录QA瓜田的初始密码。该加密算法为单向不可逆加密，我们无法获取密码原文，亦无法通过此数据再次登录爱云校或执行任何与QA瓜田身份验证无关的操作。若登录失败，一切信息都将立即被删除。
    </div>
  </a-modal>
</template>
