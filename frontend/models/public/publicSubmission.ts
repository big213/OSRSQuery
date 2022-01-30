import { Submission } from '../base'

export const PublicSubmission = {
  ...Submission,
  routeName: 'i-view',
  fields: {
    ...Submission.fields,
  },
  paginationOptions: {
    ...Submission.paginationOptions,
    headerOptions: [
      {
        field: 'ranking',
        width: '100px',
        align: 'right',
      },
      {
        field: 'eventEraRecord',
        width: '150px',
        hideIf: (that) => {
          // hide this column if the eventEra raw filter is specified and it is not '__undefined'
          const eventEraFilter = that.allFilters.find(
            (rawFilterObject) => rawFilterObject.field === 'eventEra'
          )
          return eventEraFilter && eventEraFilter.value !== '__undefined'
        },
      },
      {
        field: 'eventRecordWithParticipants',
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
        width: '120px',
      },
    ],
    downloadOptions: undefined,
  },

  viewOptions: {
    fields: [
      'eventRecordWithParticipants',
      'eventEraRecord',
      'participantsLinksListDetail',
      'score',
      'happenedOn',
      'statusReadonly',
      // 'isRecordingVerified',
      'world',
      'ranking',
      'previousRecordHappenedOn',
      // 'files',
      'externalLinks',
      //'privateComments',
      'publicComments',
    ],
  },
  addOptions: undefined,
  editOptions: undefined,
  deleteOptions: undefined,
  enterOptions: undefined,
}
