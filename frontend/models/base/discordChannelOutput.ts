import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import { getEventEraModes, getEventsByGroup } from '~/services/dropdown'
import BooleanColumn from '~/components/table/common/booleanColumn.vue'
import {
  generateJoinableField,
  generatePreviewableRecordField,
} from '~/services/recordInfo'

export const DiscordChannelOutput = <RecordInfo<'discordChannelOutput'>>{
  typename: 'discordChannelOutput',
  pluralTypename: 'discordChannelOutputs',
  name: 'Discord Channel Output',
  pluralName: 'Discord Channel Outputs',
  icon: 'mdi-format-list-checkbox',
  routeName: 'a-view',
  renderItem: (item) => item.name,
  fields: {
    id: {
      text: 'ID',
    },
    discordChannel: generateJoinableField({
      fieldname: 'discordChannel',
      typename: 'discordChannel',
      text: 'Discord Channel',
      hasAvatar: false,
    }),
    'discordChannel.id': {},
    discordChannelName: {
      text: 'Discord Channel Name',
      fields: ['discordChannel.name'],
    },
    event: {
      ...generateJoinableField({
        fieldname: 'event',
        typename: 'event',
        text: 'Event Category',
        hasAvatar: true,
        inputType: 'autocomplete',
      }),
      getOptions: getEventsByGroup,
    },
    'event.id': {},
    eventRecord: generatePreviewableRecordField({
      fieldname: 'event',
      text: 'Event',
    }),
    eventEra: generateJoinableField({
      fieldname: 'eventEra',
      typename: 'eventEra',
      text: 'Event Era',
      hasAvatar: true,
      inputType: 'select',
    }),
    'eventEra.id': {},
    eventEraRecord: generatePreviewableRecordField({
      fieldname: 'eventEra',
      text: 'Event Era',
    }),
    eventEraMode: {
      text: 'Event Era Mode',
      getOptions: getEventEraModes,
      inputType: 'select',
      default: () => 'RELEVANT_ERAS',
    },
    participants: {
      text: 'Team Size',
    },
    ranksToShow: {
      text: 'Ranks to Show',
      default: () => 1,
    },
    linesLimit: {
      text: 'Line Limit',
      optional: true,
    },
    isSoloPersonalBest: {
      text: 'Show Solo PBs only',
      inputType: 'switch',
      default: () => false,
      component: BooleanColumn,
    },
    sort: {
      text: 'Sort Order',
      default: (_that) => 10,
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
    filterOptions: [
      {
        field: 'discordChannel',
        operator: 'eq',
      },
    ],
    sortOptions: [
      {
        field: 'createdAt',
        desc: true,
      },
      {
        field: 'sort',
        desc: false,
      },
      {
        field: 'sort',
        desc: true,
      },
    ],
    headerOptions: [
      {
        field: 'sort',
        width: '150px',
      },
      {
        field: 'discordChannelName',
      },
      {
        field: 'eventRecord',
        width: '150px',
      },
      {
        field: 'participants',
        width: '150px',
      },
      {
        field: 'eventEraRecord',
        width: '150px',
      },
      {
        field: 'ranksToShow',
        width: '150px',
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
    downloadOptions: {
      fields: [
        'id',
        'sort',
        'discordChannel.id',
        'event.id',
        'participants',
        'eventEraMode',
        'eventEra.id',
        'ranksToShow',
      ],
    },
  },
  addOptions: {
    fields: [
      'sort',
      'discordChannel',
      'event',
      'participants',
      'eventEraMode',
      'eventEra',
      'ranksToShow',
      'linesLimit',
      'isSoloPersonalBest',
    ],
  },
  importOptions: {
    fields: [
      'sort',
      'discordChannel.id',
      'event.id',
      'participants',
      'eventEraMode',
      'eventEra.id',
      'ranksToShow',
      'linesLimit',
      'isSoloPersonalBest',
    ],
  },
  editOptions: {
    fields: [
      'sort',
      'discordChannel',
      'event',
      'participants',
      'eventEraMode',
      'eventEra',
      'ranksToShow',
      'linesLimit',
      'isSoloPersonalBest',
    ],
  },
  viewOptions: {
    fields: [
      'sort',
      'discordChannelName',
      'eventRecord',
      'participants',
      'eventEraMode',
      'eventEraRecord',
      'ranksToShow',
      'linesLimit',
      'isSoloPersonalBest',
    ],
  },
  enterOptions: {},
  deleteOptions: {},
  shareOptions: {},
  expandTypes: [],
}
