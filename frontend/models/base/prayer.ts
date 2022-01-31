import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/timeagoColumn.vue'
import AvatarColumn from '~/components/table/avatarColumn.vue'
import NameAvatarColumn from '~/components/table/nameAvatarColumn.vue'

export const Prayer = <RecordInfo<'prayer'>>{
  typename: 'prayer',
  pluralTypename: 'prayers',
  name: 'Prayer',
  pluralName: 'Prayers',
  icon: 'mdi-folder-information',
  routeName: 'a-view',
  renderItem: (item) => item.name,
  fields: {
    id: {
      text: 'ID',
    },
    name: {
      text: 'Name',
    },
    avatar: {
      text: 'Avatar',
      inputType: 'avatar',
      component: AvatarColumn,
    },
    description: {
      text: 'Description',
      inputType: 'textarea',
    },
    nameWithAvatar: {
      text: 'Name',
      fields: ['name', 'avatar'],
      component: NameAvatarColumn,
    },
    createdAt: {
      text: 'Created At',
      component: TimeagoColumn,
    },
    updatedAt: {
      text: 'Updated At',
      component: TimeagoColumn,
    },
  },
  paginationOptions: {
    hasSearch: false,
    filterOptions: [],
    sortOptions: [
      {
        field: 'createdAt',
        desc: true,
      },
    ],
    headerOptions: [
      {
        field: 'nameWithAvatar',
      },
      {
        field: 'createdAt',
        width: '150px',
      },
      {
        field: 'updatedAt',
        width: '150px',
      },
    ],
    downloadOptions: {},
  },
  addOptions: {
    fields: ['avatar', 'name', 'description'],
  },
  importOptions: {
    fields: ['avatar', 'name', 'description'],
  },
  editOptions: {
    fields: ['avatar', 'name', 'description'],
  },
  viewOptions: {
    fields: ['avatar', 'name', 'description'],
  },
  enterOptions: {},
  deleteOptions: {},
  shareOptions: {},
  expandTypes: [],
}
