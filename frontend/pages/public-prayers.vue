<template>
  <CrudRecordPage :record-info="recordInfo" :title="title"></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { PublicPrayer } from '~/models'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: PublicPrayer,
      title: 'Public Prayer',
    }
  },
}
</script>
