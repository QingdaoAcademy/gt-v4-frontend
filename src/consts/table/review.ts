import { PostType, ReviewStatusLabel } from '../options';
import { RouterLink } from 'vue-router';
import { Link } from '@arco-design/web-vue';
import { h } from 'vue';

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '状态',
    dataIndex: 'review_status',
    render: ({ record }: { record: any }) => {
      return ReviewStatusLabel[
        record.review_status as keyof typeof ReviewStatusLabel
      ];
    },
  },
  {
    title: '前往',
    dataIndex: 'action',
    render: ({ record }: { record: any }) => {
      const to = {} as any;
      if (record.children_count !== undefined) {
        to.name = 'comment';
        to.params = { id: record.id };
      } else if (record.post !== undefined) {
        if (record.post.type === PostType.moment) {
          to.name = 'moment';
          to.params = { id: record.post.id };
        } else if (record.post.type === PostType.article) {
          to.name = 'article';
          to.params = { id: record.post.id };
        }
      }
      if (to.name) {
        return h(RouterLink, { to: to.name ? to : undefined }, () =>
          h(Link, {}, () => '前往')
        );
      } else {
        return '-';
      }
    },
  },
];

export default {
  columns,
};
