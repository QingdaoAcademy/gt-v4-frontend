<script setup lang="ts">
import { reactive, ref, h, watch, onMounted } from 'vue';
import { Axios, errorHandler } from '../axios';
import {
  Message,
  RequestOption,
  FileItem,
  TableColumnData,
  UploadRequest,
} from '@arco-design/web-vue';
import { sharedFunctions, useStore } from '../stores';
import { ExpireDaysOptions } from '../consts/options';
import { isMobile } from '../consts/isMobile';
import router from '../router';
import { formatSize } from '../scripts/format';
import {
  formatDatetime,
  timeBeforeNow,
  formatRelativeTime,
} from '../scripts/time';
import { uploadFile } from '../scripts/uploadFile';
import { FileStorageLabel } from '../consts/options';
import AvatarName from '../components/AvatarName.vue';

const store = useStore();

const tabActiveKey = ref('receive');

// store tab state to the route

const tabChange = (key: string | number) => {
  if (!store.loggedIn && ['send', 'list'].includes(key as string)) {
    router.replace({
      name: 'login',
      query: { next: router.currentRoute.value.path },
    });
  } else {
    router.replace({
      query: { tab: key },
    });
  }
};

onMounted(() => {
  setTimeout(() => {
    const tab = router.currentRoute.value.query.tab;
    if (tab) {
      tabActiveKey.value = tab as string;
      if (tab === 'receive' && router.currentRoute.value.query.code) {
        receiveForm.code = router.currentRoute.value.query.code as string;
        getDrop();
      }
    } else {
      router.replace({
        query: { tab: tabActiveKey.value },
      });
    }
  }, 100);
});

// Receive

const receiveForm = reactive({
    code: '',
  }),
  receiveDropData = reactive({ files: [] } as any),
  getDrop = (code: string | null = null) => {
    if (code === null && !/^\d{6}$/.test(receiveForm.code)) {
      Message.warning('取件码格式错误');
      return;
    }
    Axios.get(`/drop/get/${code ?? receiveForm.code}/`)
      .then(res => {
        const data = res.data.data;
        if (code === null) {
          for (const file of data.files) file.uid = file.id;
          Object.assign(receiveDropData, data);
          Message.success('获取成功');
        } else {
          Object.assign(dropForm, data);
          uploadFileList.value = [];
          for (const file of data.files) {
            uploadFileList.value.push({
              uid: file.id,
              ...file,
            });
          }
          tabActiveKey.value = 'send';
        }
      })
      .catch(errorHandler);
  },
  downloadFile = (file: FileItem) => {
    Axios.get(
      `/drop/download/${receiveForm.code || dropForm.code}/${file.uid}/`
    ).then(res => {
      const url = res.data.url;
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      if (file.name) a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

const customIcon = {
  fileName: (file: any) => {
    return `${file.name} (${formatSize(file.size)})`;
  },
};

// Send

const uploadFileList = ref([] as FileItem[]);

const dropForm = reactive({
    id: null,
    code: null,
    expire_days: 1,
    max_download: 0,
    require_login: false,
    pay_by_download: false,
    storage: 'dogecloud',
  }),
  loadingCreateDrop = ref(false),
  createDrop = ({ errors, values }: any) => {
    if (errors) return;
    loadingCreateDrop.value = true;
    Axios.post('/drop/', {
      ...values,
    })
      .then(res => {
        Object.assign(dropForm, res.data.data);
        Message.success('创建成功，请上传文件');
      })
      .finally(() => {
        loadingCreateDrop.value = false;
      });
  };
const handleUpload = (option: RequestOption) => {
  uploadFile(
    option,
    {
      storage: dropForm.storage,
      expire_days: dropForm.expire_days,
    },
    (data: any) =>
      Axios.post(`/drop/${dropForm.id}/add_file/`, {
        file_id: data.id,
      })
  );
  return {} as UploadRequest;
};

// List

let dropListLoading = ref(false);
const myDropList = ref([] as any),
  myDropPaginationProps = ref({
    current: 1,
    pageSize: 20,
    total: 0,
    showTotal: true,
  });
const getMyDropList = () => {
  dropListLoading.value = true;
  Axios.get('/drop/', {
    params: {
      page: myDropPaginationProps.value.current,
      page_size: myDropPaginationProps.value.pageSize,
    },
  })
    .then(res => {
      myDropList.value = res.data.results;
      myDropPaginationProps.value.total = res.data.count;
      dropListLoading.value = false;
    })
    .finally(() => {
      dropListLoading.value = false;
    });
};
const changeDropListPagination = (page: number) => {
  myDropPaginationProps.value.current = page;
  getMyDropList();
};
getMyDropList();
watch(
  () => store.roleId,
  () => {
    getMyDropList();
  }
);

const cancelDrop = (record: any) => {
  Axios.delete(`/drop/${record.id}/`).then(() => {
    Message.success('取消成功');
    record.expired = true;
  });
};

//

const recordExpired = (record: any, text: boolean = false) => {
    const res = record.expired || timeBeforeNow(record.expire_time);
    if (text) {
      return res ? '已过期' : '未过期';
    }
    return res;
  },
  myDropColumns = [
    {
      title: '取件码',
      dataIndex: 'code',
    },
    {
      title: '过期时间',
      dataIndex: 'expire_time',
      render: ({ record }) => {
        return h(
          'span',
          {
            style: {
              color: recordExpired(record) ? 'var(--color-text-3)' : undefined,
            },
          },
          h(
            'span',
            {},
            record.expired || timeBeforeNow(record.expire_time)
              ? '已过期'
              : formatRelativeTime(record.expire_time, true)
          )
        );
      },
    },
  ] as TableColumnData[],
  getDropDescription = (record: any) => {
    return [
      {
        label: '取件码',
        value: record.code,
      },
      {
        label: '创建时间',
        value: formatDatetime(record.create_time),
      },
      {
        label: '过期时间',
        value: formatDatetime(record.expire_time),
      },
      {
        label: '状态',
        value: recordExpired(record, true),
      },
      {
        label: '存储服务商',
        value:
          FileStorageLabel[record.storage as keyof typeof FileStorageLabel],
      },
      {
        label: '最大下载次数',
        value: record.max_download || '-',
      },
      {
        label: '当前下载次数',
        value: record.download_count,
      },
      {
        label: '登录后下载',
        value: record.require_login ? '是' : '否',
      },
      {
        label: '下载者付费',
        value: record.pay_by_download ? '是' : '否',
      },
    ];
  };

const dropList = ref();

const saveShareFile = () => {
  dropList.value.expandAll(false);
  dropList.value.expand(dropForm.id, true);
  dropForm.id = null;
  uploadFileList.value = [];
  tabActiveKey.value = 'list';
  getMyDropList();
};
</script>

<template>
  <a-layout class="admin-layout">
    <a-typography-title :heading="3" v-if="!isMobile">
      空投
    </a-typography-title>

    <a-tabs
      type="rounded"
      size="large"
      :class="{ 'arco-tabs-mobile': isMobile }"
      v-model:active-key="tabActiveKey"
      @change="tabChange"
    >
      <a-tab-pane key="receive" title="获取文件">
        <a-space
          direction="vertical"
          :size="35"
          class="pane-wrapper"
          v-if="!receiveDropData.id"
        >
          <a-typography-title
            :heading="5"
            style="text-align: center; margin: 0"
          >
            请输入取件码
          </a-typography-title>
          <a-verification-code
            v-if="!isMobile"
            :formatter="
              inputValue => (/^\d*$/.test(inputValue) ? inputValue : false)
            "
            v-model="receiveForm.code"
            size="large"
            @keydown.enter="getDrop()"
            @finish="getDrop()"
          />
          <a-input
            v-else
            v-model="receiveForm.code"
            size="large"
            style="width: 100%; text-align: center"
            @keydown.enter="getDrop()"
          />
          <a-button type="primary" size="large" @click="getDrop()">
            <template #icon>
              <IconDownload />
            </template>
            获取文件
          </a-button>
        </a-space>
        <div v-if="receiveDropData.id">
          <div>
            <a-typography-title
              :heading="4"
              style="
                display: flex;
                align-items: center;
                gap: 10px;
                justify-content: center;
              "
            >
              来自 <AvatarName :role="receiveDropData.role" /> 的文件
            </a-typography-title>
          </div>
          <a-typography-title :heading="6"> 文件列表 </a-typography-title>
          <a-upload
            class="receive-file-list"
            :file-list="receiveDropData.files"
            :show-cancel-button="false"
            :show-remove-button="false"
            :show-link="false"
            :custom-icon="customIcon"
            @preview="downloadFile"
          />
          <a-collapse style="margin: 2em auto" :bordered="false">
            <a-collapse-item header="详细信息" key="detail">
              <div>
                <a-descriptions
                  style="margin-top: 5px"
                  :data="getDropDescription(receiveDropData)"
                  size="medium"
                  :column="isMobile ? 1 : 2"
                />
              </div>
            </a-collapse-item>
            <a-collapse-item header="下载说明" key="help">
              <div>
                当您下载空投文件时，我们将根据文件分享者的设置，从分享者或下载者账号中扣除相应积分。具体规则请参考
                <a-link>积分说明</a-link>。
              </div>
              <div>
                服务器生成的下载链接内都包含其用户ID和名称，将下载链接分享给他人可能面临因违规使用导致的账号封禁，同时也有隐私信息的泄露风险。
              </div>
            </a-collapse-item>
          </a-collapse>
          <a-space style="display: flex; justify-content: center">
            <a-button type="primary" @click="receiveDropData.id = null">
              返回
            </a-button>
            <a-button
              type="primary"
              status="warning"
              @click="sharedFunctions.showReport(receiveDropData.id, 'drop')"
            >
              举报
            </a-button>
          </a-space>
        </div>
      </a-tab-pane>

      <a-tab-pane key="send" title="发送文件">
        <a-alert style="margin-bottom: 2em">
          空投限时免费，后期将基于积分系统进行一定限制和提供更优质服务
        </a-alert>
        <a-form
          :model="dropForm"
          @submit="createDrop"
          v-if="dropForm.id === null"
        >
          <a-form-item label="分享有效期" tooltip="文件将在设置的时间后删除">
            <a-radio-group
              type="button"
              v-model="dropForm.expire_days"
              :options="ExpireDaysOptions"
            />
          </a-form-item>
          <a-form-item
            label="最大下载次数"
            tooltip="设置为0则不限制下载次数；同一用户下载分享中的多个文件视为多次下载"
          >
            <a-input-number
              style="max-width: 150px"
              :min="0"
              mode="button"
              v-model="dropForm.max_download"
            />
          </a-form-item>
          <a-form-item
            label="是否需要登录"
            tooltip="开启后，只有登录的用户可以下载文件"
            disabled
          >
            <a-switch
              v-model="dropForm.require_login"
              :disabled="dropForm.pay_by_download"
            />
          </a-form-item>
          <a-form-item
            label="下载者付费"
            tooltip="开启后，下载流量产生的积分扣款将从下载者账号中扣除"
            disabled
          >
            <a-switch
              v-model="dropForm.pay_by_download"
              @change="
                () =>
                  (dropForm.require_login = dropForm.pay_by_download
                    ? true
                    : dropForm.pay_by_download)
              "
            />
          </a-form-item>
          <!-- <a-form-item
            label="存储服务商"
            tooltip="不同的存储服务商产生的费用不同"
          >
            <a-radio-group
              type="button"
              v-model="dropForm.storage"
              :options="FileStorageOptions"
            />
          </a-form-item> -->
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loadingCreateDrop"
            >
              创建分享
            </a-button>
          </a-form-item>
        </a-form>
        <div v-else-if="dropForm.code !== null" class="receive-code">
          <div class="receive-code-title">取件码</div>
          <a-typography-paragraph copyable class="receive-code-value">
            {{ dropForm.code }}
          </a-typography-paragraph>
          <a-upload
            :draggable="!isMobile"
            v-model:file-list="uploadFileList"
            :custom-request="handleUpload"
            :show-cancel-button="false"
            :auto-upload="true"
            :show-remove-button="false"
            @preview="downloadFile"
            multiple
            style="width: min(max(60%, 500px), 100%); margin: 0 auto 2em auto"
          />
          <a-button @click="saveShareFile()"> 保存分享的文件 </a-button>
        </div>

        <a-collapse style="margin-top: 4em" :bordered="false">
          <a-collapse-item header="使用说明">
            <div>
              文件上传成功后将自动更新取件码对应的文件列表，你可以在上传完成后离开此界面。
            </div>
            <div style="font-weight: bold">
              文件一经上传成功即开始计入使用空间，删除后不会释放。所有文件将在你设置的到期时间后自动删除，不可找回。
            </div>
            <div>
              严禁上传任何形式的违规内容，严禁以任何形式尝试欺骗计费系统，违者将视情况采取限制措施，包括但不限于永久封禁账号、在站内公示和向公安机关报告。
            </div>
            <div>
              上传文件视为你同意瓜田和瓜田信任的第三方（包括但不限于阿里云、腾讯云、微软）出于安全和合规目的将你的文件跨境传输并进行内容审核，如有涉及隐私内容，请使用加密压缩包形式上传。
            </div>
            <div>
              我们将在每月的运营情况公示中向大家展示空投服务的成本信息。
            </div>
          </a-collapse-item>
        </a-collapse>
      </a-tab-pane>

      <a-tab-pane key="list" title="我的分享">
        <a-alert style="margin: 1em 0">
          如果未找到想找的分享记录，请尝试切换角色
        </a-alert>
        <a-table
          :columns="myDropColumns"
          :data="myDropList"
          v-model:pagination="myDropPaginationProps"
          :expandable="{}"
          row-key="id"
          :loading="dropListLoading"
          @page-change="changeDropListPagination"
          ref="dropList"
        >
          <template #expand-row="{ record }">
            <a-descriptions
              style="margin-top: 5px"
              :data="getDropDescription(record)"
              size="medium"
              :column="isMobile ? 1 : 2"
            />
            <a-space v-if="!recordExpired(record)" style="margin: 0.2em 0">
              <a-button
                type="primary"
                @click="getDrop(record.code)"
                size="small"
              >
                文件管理
              </a-button>
              <a-popconfirm type="warning" @ok="cancelDrop(record)">
                <template #content>
                  你确定要取消分享吗？ <br />
                  取消后该记录不会从本列表中删除。
                </template>
                <a-button type="primary" status="warning" size="small">
                  取消分享
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </a-layout>
</template>

<style lang="scss" scoped>
.admin-layout {
  padding: 5vh 5vw;
  max-width: max(800px, 60vw);
  margin: 0 auto;

  h3 {
    margin: 0 0 3vh 0.2em;
  }
}

.pane-wrapper {
  width: 100%;
  justify-content: center;
  align-items: center;
  height: 22rem;
}

.arco-form-item {
  justify-content: center;
}

.arco-verification-code {
  column-gap: min(2em, 2vw);
  justify-content: center;

  :deep(.arco-input-wrapper) {
    justify-content: flex-start;
  }

  :deep(.arco-input-size-large) {
    width: min(4em, 10vw);
  }

  :deep(.arco-input-wrapper .arco-input.arco-input-size-large) {
    line-height: min(3em, 3vw);
    font-size: 2em;
    width: min(2em, 10vw);
  }
}

:deep(.arco-tabs-content) {
  max-width: min(max(700px, 40vw), 90vw);
  padding-top: 30px;
  margin: 0 auto;
}

.receive-code-title {
  font-size: 1.3em;
  margin-bottom: 0.8em;
}

.receive-code-value {
  font-size: 2em;
  letter-spacing: 0.5em;
  margin-bottom: 1em;
}

.receive-file-list {
  :deep(.arco-upload) {
    display: none;
  }

  :deep(.arco-upload-progress) {
    display: none;
  }
}

:deep(.arco-upload-list-item-name-text) {
  color: rgb(var(--link-6));
}

.arco-input-number {
  :deep(.arco-input) {
    text-align: center;
  }
}

.receive-code {
  width: 100%;
  text-align: center;
  margin-bottom: 2em;

  :deep(.arco-statistic-value-integer) {
    letter-spacing: 0.5em;
  }
}
</style>
