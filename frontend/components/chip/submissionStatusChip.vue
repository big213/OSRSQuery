<template>
  <v-chip :color="color" v-bind="$attrs" v-on="$listeners">
    <span class="black--text">{{ title }}</span>
  </v-chip>
</template>

<script>
import { submissionStatusMap } from '~/services/constants'

export default {
  props: {
    indexOrName: {}, // can be the index OR name
  },
  data() {
    return {}
  },

  computed: {
    title() {
      return submissionStatusMap[this.indexOrName]?.text
    },
    color() {
      return submissionStatusMap[this.indexOrName]?.color
    },
  },
}
</script>
