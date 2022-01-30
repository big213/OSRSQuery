import type { RecordInfo } from '~/types'
import {
  generateDateLocaleString,
  generateParseDateTimeStringFn,
} from '~/services/base'
import TimeStringColumn from '~/components/table/common/timeStringColumn.vue'
import NameAvatarColumn from '~/components/table/common/nameAvatarColumn.vue'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import AvatarColumn from '~/components/table/common/avatarColumn.vue'
import BooleanColumn from '~/components/table/common/booleanColumn.vue'
import { getEvents } from '~/services/dropdown'
import {
  generateJoinableField,
  generatePreviewableRecordField,
} from '~/services/recordInfo'

export const EventEra = <RecordInfo<'eventEra'>>{
  typename: 'eventEra',
  pluralTypename: 'eventEras',
  name: 'Event Era',
  pluralName: 'Event Eras',
  icon: 'mdi-calendar-star',
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
    event: {
      ...generateJoinableField({
        fieldname: 'event',
        typename: 'event',
        text: 'Event Category',
        hasAvatar: true,
        inputType: 'autocomplete',
      }),
      getOptions: getEvents,
    },
    'event.id': {},
    'event.name': {},
    eventRecord: generatePreviewableRecordField({
      fieldname: 'event',
      text: 'Event Category',
    }),
    beginDate: {
      text: 'Start Date',
      inputType: 'datepicker',
      hint: 'To specify the exact date and time, use format: YYYY-MM-DD 1:23 PM',
      // YYYY-MM-DD to unix timestamp
      parseValue: generateParseDateTimeStringFn('startOfDay'),
      parseImportValue: (val: string) => {
        if (!val) return null

        // only works on certain browsers
        const msTimestamp = new Date(val).getTime()

        return msTimestamp / 1000
      },
      component: TimeStringColumn,
    },
    endDate: {
      text: 'End Date',
      inputType: 'datepicker',
      hint: 'To specify the exact date and time, use format: YYYY-MM-DD 1:23 PM',
      // YYYY-MM-DD to unix timestamp
      parseValue: generateParseDateTimeStringFn('startOfDay'),
      parseImportValue: (val: string) => {
        if (!val) return null

        // only works on certain browsers
        const msTimestamp = new Date(val).getTime()

        return msTimestamp / 1000
      },
      component: TimeStringColumn,
    },
    isBuff: {
      text: 'Is Buff',
      inputType: 'switch',
      component: BooleanColumn,
      default: () => true,
    },
    isRelevant: {
      text: 'Is Relevant',
      inputType: 'switch',
      component: BooleanColumn,
    },
    isCurrent: {
      text: 'Is Current',
      inputType: 'switch',
      component: BooleanColumn,
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
      {
        field: 'beginDate',
        desc: true,
      },
    ],
    headerOptions: [
      {
        field: 'nameWithAvatar',
        sortable: false,
      },
      {
        field: 'isCurrent',
        width: '150px',
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
    downloadOptions: {
      fields: [
        'id',
        'event.id',
        'event.name',
        'avatar',
        'name',
        'description',
        'beginDate',
        'endDate',
      ],
    },
  },
  addOptions: {
    fields: [
      'event',
      'avatar',
      'name',
      'description',
      'beginDate',
      'endDate',
      'isBuff',
    ],
  },
  importOptions: {
    fields: [
      'event.id',
      'avatar',
      'name',
      'description',
      'beginDate',
      'endDate',
      'isBuff',
    ],
  },
  editOptions: {
    fields: [
      'event',
      'avatar',
      'name',
      'description',
      'beginDate',
      'endDate',
      'isBuff',
    ],
  },
  viewOptions: {
    fields: [
      'eventRecord',
      'nameWithAvatar',
      'description',
      'beginDate',
      'endDate',
      'isBuff',
      'isCurrent',
      'isRelevant',
    ],
  },
  enterOptions: {},
  deleteOptions: {},
  shareOptions: {},
  expandTypes: [],
}
