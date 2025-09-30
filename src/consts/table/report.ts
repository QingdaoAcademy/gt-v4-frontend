import { ReportStatusOptions, ReportContentTypeLabel } from '../options';
import {
  TableColumnData,
  Dropdown,
  Link,
  Doption,
  Message,
} from '@arco-design/web-vue';
import { h } from 'vue';
import { RouterLink } from 'vue-router';
import { useStore } from '../../stores';
import { Axios, errorHandler } from '../../axios';

const store = useStore();

const _columns = store.permission.admin_report
  ? [
      {
        title: '操作',
        width: 70,
        ellipsis: true,
        tooltip: true,
        // @ts-ignore
        render: ({ record }) => {
          return () =>
            h(
              Dropdown,
              {
                onSelect: value => {
                  Axios.patch(`/report/${record.id}/`, {
                    status: value,
                  })
                    .then(res => {
                      Message.success('操作成功');
                      record.status = res.data.status;
                      record.operator = res.data.operator;
                    })
                    .catch(errorHandler);
                },
              },
              {
                default: () => h(Link, {}, () => '操作'),
                content: () =>
                  ReportStatusOptions.map(item =>
                    h(Doption, { value: item.value }, () => item.label)
                  ),
              }
            );
        },
      },
    ]
  : [];

const columns = [
  ..._columns,
  {
    title: '举报内容',
    dataIndex: 'content',
    render: ({ record }) => {
      return () => {
        const to = {} as any;
        if (record.content_type === 'post') {
          to.params = {
            id: record.content_id,
          };
          to.name = ['', 'admin-post-detail', 'admin-post-detail'][
            record.extra_content.post_type
          ];
        } else if (record.content_type === 'drop') {
          to.name = 'drop';
          to.query = {
            tab: 'receive',
            code: record.extra_content.drop_code,
          };
        } else if (record.content_type === 'comment') {
          to.name = 'admin-comment-detail';
          to.params = {
            id: record.content_id,
          };
        }
        return h(
          RouterLink,
          {
            to,
          },
          () =>
            h(
              Link,
              {},
              () =>
                `${
                  ReportContentTypeLabel[
                    record.content_type as keyof typeof ReportContentTypeLabel
                  ]
                }[${record.content_id}]`
            )
        );
      };
    },
    ellipsis: true,
    tooltip: true,
    width: 130,
  },
  {
    title: '说明',
    dataIndex: 'explanation',
    ellipsis: true,
    tooltip: true,
    width: 100,
  },
  {
    title: '用户',
    dataIndex: 'user',
    ellipsis: true,
    tooltip: true,
    width: 100,
    render: ({ record }) => {
      if (record.user)
        return () => `${record.user.real_name}(${record.user?.username})`;
      else return '-';
    },
  },
  {
    title: '操作者',
    dataIndex: 'operator',
    ellipsis: true,
    tooltip: true,
    width: 100,
    render: ({ record }) => {
      if (!record.operator) return '-';
      return () => `${record.operator.real_name}(${record.operator.username})`;
    },
  },
] as TableColumnData[];

export default {
  columns,
};
