<script setup lang="ts">
import { ref } from 'vue';

const showQRCode = ref(false);
</script>

<template>
  <div class="card-container">
    <a-card>
      <a-typography-title :heading="2"> 注册 </a-typography-title>

      <a-divider class="divider-30" />

      <div style="margin-bottom: 1.5em">
        <a-typography-text style="font-size: 1.1em">
          为了兼顾QA瓜田的合规性、社区秩序与用户隐私，我们现提供如下注册方式。为了节省你我的时间，请务必认真阅读注册要求。
        </a-typography-text>
      </div>

      <a-collapse :default-active-key="['1']">
        <a-collapse-item header="企业微信验证（推荐）" key="1">
          请你使用<b>本人的青岛中学或青岛金家岭学校企业微信</b>扫描<a-link
            @click="showQRCode = true"
            >二维码</a-link
          >添加“QA瓜田服务”微信账号，并告知我们你的<b>学号（必须）</b>和用户名（可选；用户名唯一且不变，仅用于登录QA瓜田，发布内容时展示的角色名可在注册后自行设置）。我们将在人工审核后为你开设账号并告知结果。
        </a-collapse-item>
        <a-collapse-item header="提交材料验证" key="2">
          使用任意微信扫描<a-link @click="showQRCode = true">二维码</a-link
          >或搜索微信号qagtservice添加“QA瓜田服务”微信账号，或发送邮件至
          gt@qaguatian.com，并告知我们你的<b>姓名、学号（必须）</b>和用户名（可选；用户名唯一且不变，仅用于登录QA瓜田，发布内容时展示的角色名可在注册后自行设置），并提供你是青岛中学或青岛金家岭学校学生的证明材料（包括但不限于校园卡照片、爱云校课程表截图等）。我们将在人工审核后为你开设账号并告知结果。
        </a-collapse-item>
      </a-collapse>
    </a-card>
  </div>

  <a-image-preview
    src="https://image.qaguatian.com/wechat_qrcode.jpg"
    v-model:visible="showQRCode"
    :actions-layout="[]"
  />
</template>
