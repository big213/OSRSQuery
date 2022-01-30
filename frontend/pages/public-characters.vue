<template>
  <CrudRecordPage :record-info="recordInfo" :title="title"></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { PublicCharacter } from '~/models'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: PublicCharacter,
      title: 'Public Characters',
    }
  },
}
</script>
