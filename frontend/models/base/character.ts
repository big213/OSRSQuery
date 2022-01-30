import type { RecordInfo } from '~/types'
import NameAvatarColumn from '~/components/table/common/nameAvatarColumn.vue'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import AvatarColumn from '~/components/table/common/avatarColumn.vue'
import { Submission } from './submission'
import { generateJoinableField } from '~/services/recordInfo'

export const Character = <RecordInfo<'character'>>{
  typename: 'character',
  pluralTypename: 'characters',
  name: 'Character',
  pluralName: 'Characters',
  icon: 'mdi-account',
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
    nameWithAvatar: {
      text: 'Name',
      fields: ['name', 'avatar'],
      component: NameAvatarColumn,
    },
    description: {
      text: 'Description',
      inputType: 'textarea',
    },
    ownedBy: generateJoinableField({
      fieldname: 'ownedBy',
      typename: 'user',
      text: 'Owned By',
      hasAvatar: true,
    }),
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
    hasSearch: true,
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
        sortable: false,
      },
      {
        field: 'ownedBy',
        width: '150px',
        sortable: false,
      },
      {
        field: 'createdAt',
        width: '150px',
        sortable: true,
      },
      {
        field: 'updatedAt',
        width: '150px',
        sortable: true,
      },
    ],
    downloadOptions: {},
  },
  addOptions: {
    fields: ['ownedBy', 'avatar', 'name', 'description', 'isHardMode'],
  },
  // importOptions: { fields: ['avatar', 'name', 'description', 'isPublic'] },
  editOptions: {
    fields: ['avatar', 'name', 'description'],
  },
  viewOptions: {
    fields: [
      'avatar',
      'name',
      'description',
      // 'owedBy.id'
    ],
  },
  enterOptions: {},
  deleteOptions: {},
  shareOptions: {},
  expandTypes: [
    {
      recordInfo: Submission,
      name: 'Approved Submissions',
      lockedFilters: (_that, item) => {
        return [
          {
            field: 'submissionCharacterParticipantLink/character',
            operator: 'eq',
            value: item.id,
          },
          {
            field: 'status',
            operator: 'eq',
            value: 'APPROVED',
          },
        ]
      },
      initialSortOptions: {
        field: 'createdAt',
        desc: true,
      },
    },
  ],
}
