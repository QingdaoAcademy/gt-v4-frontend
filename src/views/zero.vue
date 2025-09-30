<template>
  <a-typography-title :heading="2">文本暗水印</a-typography-title>
  <a-divider />
  <a-space direction="vertical" fill>
    <a-textarea v-model="text" placeholder="载体文本" allow-clear />
    <a-textarea
      v-model="invisible"
      placeholder="隐藏文本（水印）"
      allow-clear
    />
    <a-divider />
    <a-input v-model="aesKey" placeholder="AES 二次加密密钥" allow-clear />
    <a-row :gutter="[8, 8]">
      <a-col :span="12">
        <a-button size="large" long @click="handleEncryptChange()" color="blue">
          <template #icon>
            <icon-down />
          </template>
          加密
        </a-button>
      </a-col>
      <a-col :span="12">
        <a-button long size="large" @click="handleDecryptChange()">
          <template #icon>
            <icon-up />
          </template>
          解密
        </a-button>
      </a-col>
      <a-col :span="24">
        <a-button
          long
          type="outline"
          @click="text = aesKey = invisible = encrypted = ''"
          >清除所有</a-button
        >
      </a-col>
    </a-row>
    <a-divider />

    <a-textarea v-model="encrypted" placeholder="密文" allow-clear />
  </a-space>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { AES } from 'crypto-js';
import { encode, extract } from 'zero-width-lib';

const aesEncrypt = (text: string) => {
  return AES.encrypt(text, aesKey.value).toString();
};
const aesDecrypt = (text: string) => {
  return AES.decrypt(text, aesKey.value).toString();
};
let text = ref('');
let invisible = ref('');
let aesKey = ref('');
let encrypted = ref('');

const handleEncryptChange = () => {
  encrypted.value = aesKey.value
    ? encode(text.value, aesEncrypt(invisible.value))
    : encode(text.value, invisible.value);
};
const handleDecryptChange = () => {
  if (aesKey.value) {
    let ext = extract(encrypted.value);
    text.value = ext.vis;
    invisible.value = aesDecrypt(ext.hid);
  } else {
    let ext = extract(encrypted.value);
    text.value = ext.vis;
    invisible.value = ext.hid;
  }
};
</script>
