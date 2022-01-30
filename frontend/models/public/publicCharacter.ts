import { PublicSubmission } from './publicSubmission'
import { Character } from '../base'
export const PublicCharacter = {
  ...Character,
  routeName: 'i-view',
  paginationOptions: {
    ...Character.paginationOptions,
    downloadOptions: undefined,
  },
  addOptions: undefined,
  editOptions: undefined,
  deleteOptions: undefined,
  expandTypes: [
    {
      recordInfo: {
        ...PublicSubmission,
        paginationOptions: {
          ...PublicSubmission.paginationOptions,
          headerOptions: [
            {
              field: 'ranking',
              width: '100px',
              align: 'right',
            },
            {
              field: 'eventRecordWithParticipants',
              width: '250px',
            },
            {
              field: 'eventEraRecord',
              width: '250px',
            },
            {
              field: 'participantsLinksList',
            },
            {
              field: 'score',
              width: '200px',
              align: 'right',
            },
            {
              field: 'mainExternalLink',
              width: '150px',
            },
            {
              field: 'happenedOn',
              width: '150px',
            },
          ],
          downloadOptions: undefined,
        },
      },
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
        field: 'happenedOn',
        desc: true,
      },
    },
  ],
}
