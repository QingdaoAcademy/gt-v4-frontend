<script setup lang="ts">
// import { ref } from 'vue';
// import oldUsers from '../consts/oldUsers.json';
import { isMobile } from '../consts/isMobile';

const timelineData = [
  {
    label: '2022年2月26日',
    title: 'QA瓜田首次发布',
    content:
      '那是一个连登录和注册的接口都没有区分的测试版，但是受到了全校同学的大量欢迎和转发，上线当日全部资源累计被访问6万余次',
    dotColor: 'var(--color-fill-4)',
  },
  {
    label: '2022年3月19日',
    title: 'V3.0版本发布',
    content: '更加现代化的界面和大量新功能。',
    dotColor: 'var(--color-fill-4)',
  },
  {
    label: '2022年3月19日<br />-2022年12月',
    title: '大量新功能上线',
    content:
      'Tape提问箱，但由于不时受到网络攻击，以及同学们的热情退去，活跃用户不断减少。',
    dotColor: 'var(--color-fill-4)',
  },
  {
    label: '2024年4月3日',
    title: '瓜田V3.0站点关闭',
    content: '在30天无新的创作内容产生后，我们关闭了瓜田。',
    dotColor: 'var(--color-fill-4)',
  },
  {
    label: '2024年9月2日',
    title: '瓜田V4.0项目成立',
    content:
      '在某同学提议下，瓜田团队再出发。本次开发推翻了瓜田过去的所有代码、从零开始建构，将致力于更好的社区环境、更严格的信息保护以及更丰富和独特的功能。',
  },
  {
    label: '2024年9月17日',
    title: '发布第一个V4.0测试版本',
    content: '用户、角色和论坛相关功能基本开发完毕，开始进行非公开测试。',
  },
  {
    label: '2024年10月18日',
    title: '先导宣传片发布',
    content: '瓜田V4.0项目正式进入公众视野。',
  },
  {
    label: '2024年10月19日',
    title: '确定发布日期',
    content:
      '内测团队讨论决定，瓜田V4.0将于11月2日正式发布，发布前准备和宣传工作同步开启。',
  },
  {
    label: '2024年11月2日',
    title: 'QA瓜田V4.0正式发布',
    content: '瓜田V4.0正式发布，欢迎大家前来体验！',
  },
  {
    label: '2024年11月18日',
    title: 'QA瓜田暂停运营',
    content: '应非政府部门的监管要求，QA瓜田暂时停止运营。',
    dotColor: '	rgb(var(--orange-5))',
  },
  {
    label: '2025年4月18日',
    title: '重新开始开发工作',
    content: '进行功能维护，优化注册方式，开发校友墙功能，为重新发布做好准备。',
  },
  {
    label: '2025年7月3日',
    title: 'QA瓜田准备好再次发布',
    content: '期待与大家见面！',
  },
];

const oldUsersBrief = [
  '倒霉熊',
  'Monday',
  'WHOAMI',
  'Alpha',
  'modenicheng',
  '铁锅炖自己',
  'Iron_Grey_',
  '攸の心',
  'Huangsam04',
  '爱心修勾',
  '焦头烂鹅',
  '麻木',
  '葭樱',
  'xiao',
  'qwer',
  'faceybro_',
  '暖冬',
];

// const oldUserVisible = ref(false),
//   oldUserScrollbar = ref(true);
</script>

<template>
  <a-layout class="timeline-container">
    <a-typography-title
      style="margin: 0 0 1.2em 0"
      :heading="2"
      v-if="!isMobile"
    >
      关于瓜田
    </a-typography-title>

    <a-typography-paragraph style="font-size: 1.2em; margin-bottom: 1em">
      QA瓜田是由已毕业的青岛中学HCC项目开发社团独立开发和运营的、面向青岛中学师生的在线网站，提供论坛、文件传输等多种功能。
      <br />
      <br />
      此页面是与瓜田有关的一般信息，更多使用帮助请
      <a-link
        href="https://kdocs.cn/l/cbt2Crb2SKh2"
        target="_blank"
        style="font-size: 1em; margin: 0 -0.3em"
      >
        点我查看
      </a-link>
      。有关用户使用与隐私政策请
      <a-link
        href="https://kdocs.cn/l/ch70CbANT3nn"
        target="_blank"
        style="font-size: 1em; margin: 0 -0.3em"
      >
        点我查看
      </a-link>
      。若有任何疑问，你可以通过邮箱
      <a-link href="mailto:gt@qaguatian.com" style="font-size: 1em">
        gt@qaguatian.com
      </a-link>
      联系我们，我们通常会在24小时内回复。
    </a-typography-paragraph>

    <a-divider />

    <a-typography-paragraph style="font-size: 1.2em; margin: 1em 0">
      如果你是青岛中学新成员或过去未使用过瓜田，可以通过下面的时间线初步了解我们。
    </a-typography-paragraph>

    <a-timeline mode="left" label-position="relative">
      <a-timeline-item
        v-for="item in timelineData"
        :key="item.label"
        :dotColor="item.dotColor"
      >
        <template #label>
          <span v-html="item.label" />
        </template>
        <div :style="{ marginBottom: '12px' }">
          {{ item.title }}
          <div :style="{ fontSize: '0.85em', color: '#4E5969' }">
            {{ item.content }}
          </div>
        </div>
      </a-timeline-item>
    </a-timeline>

    <a-divider />

    <div class="old-users-container">
      <a-typography-paragraph style="font-size: 1.2em">
        我们特别感谢以下用户过去对瓜田的支持（按发贴数量排序；展示发贴数量不少于10条、用户名无冒充嫌疑的用户）：
      </a-typography-paragraph>
      <a-space wrap style="margin-bottom: 0.7em">
        <a-tag v-for="user in oldUsersBrief" :key="user" size="large">
          {{ user }}
        </a-tag>
      </a-space>
      <a-typography-paragraph style="font-size: 1.2em">
        <a-link href="https://v3.qaguatian.com/" style="font-size: 0.95em"
          >点击此处</a-link
        >查看旧版瓜田的帖子和用户存档。
      </a-typography-paragraph>
    </div>

    <a-divider />

    <a-typography-paragraph style="font-size: 1.2em">
      若你认可我们的项目，你可以考虑赞助我们。我们承诺所有赞助款项都将被用于运营之中。
      <br />
      在赞助时请备注是否希望我们公开展示您的赞助信息，若是，请额外提供你希望我们展示的名称。
      <br />
      如在赞助后希望退款，请在12个月内联系微信qagtservice。
    </a-typography-paragraph>
    <div style="margin: 0.5em 0; text-align: center">
      <a-image src="https://image.qaguatian.com/sponsor.png" width="300px" />
    </div>
    <a-typography-paragraph style="font-size: 1.2em; margin-top: 1em">
      已经收到的赞助信息如下（非实时更新）：
    </a-typography-paragraph>
  </a-layout>

  <!-- <a-modal v-model:visible="oldUserVisible" title="用户名单" hide-cancel>
    <a-typography-paragraph style="font-size: 1.1em">
      以下是瓜田V1.0-3.0的所有用户名单，我们对所有用户的支持表示诚挚的感谢！
    </a-typography-paragraph>
    <a-list
      :scrollbar="oldUserScrollbar"
      :virtualListProps="{
        height: '60vh',
      }"
      :data="oldUsers"
    >
      <template #item="{ item }">
        <a-list-item :key="item[0]" :alt="`ID=${item[0]}`">
          {{ item[1] }}
        </a-list-item>
      </template>
    </a-list>
  </a-modal> -->
</template>

<style lang="scss" scoped>
.timeline-container {
  max-width: min(max(50vw, 700px), 95vw);
  margin: 50px auto;
}
.arco-timeline {
  margin-left: 2em;
}
:deep(.arco-timeline-item-label) {
  margin-top: 1.5px;
  font-size: 0.95em;
  max-width: unset;
  padding-right: 10px;
}
:deep(.arco-timeline-item-dot-line.arco-timeline-item-dot-line-is-vertical) {
  margin-left: 2px;
}
:deep(.arco-timeline-item-dot) {
  width: 10px;
  height: 10px;
}
:deep(.arco-timeline-item-content) {
  font-size: 1.1em;
}
</style>
