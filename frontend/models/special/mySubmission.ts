import { Submission } from '../base'
import EditSubmissionInterface from '~/components/interface/crud/special/editSubmissionInterface.vue'

export const MySubmission = {
  ...Submission,
  routeName: 'm-view',
  addOptions: {
    fields: [
      'event',
      'eventEra',
      'timeElapsed',
      'participantsList',
      'externalLinks',
      'happenedOn',
      'world',
      // 'files',
      'privateComments',
      'publicComments',
      'discordId',
      // 'status',
    ],
    component: EditSubmissionInterface,
  },
  editOptions: undefined,
  deleteOptions: undefined,
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
      'externalLinks',
      'privateComments',
      'publicComments',
      'reviewerComments',
      'discordId',
    ],
  },
}
