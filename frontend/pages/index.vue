<template>
  <v-layout column justify-center align-center>
    <v-container xs12 style="max-width: 600px">
      <div class="text-center">
        <img
          src="../static/logo-raw-horizontal-trimmed.png"
          alt=""
          style="width: 60%"
        />
      </div>
      <v-card>
        <v-card-title class="headline">
          Welcome to OSRSRecords.com
        </v-card-title>
        <v-card-text>
          <p>
            OSRSRecords.com is a website dedicated to tracking records in the
            Old School RuneScape community. Please also check out our official
            <a href="https://discord.gg/8U56ZZn" target="_blank"
              >Discord server</a
            >. If you would prefer to email, our email is
            <a>hello@osrsrecords.com</a>.
          </p>
          <p>
            RuneScape is a registered trademark of Jagex Ltd. This site is in no
            way affiliated with Jagex Ltd.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openCreateSubmissionDialog()">
            <v-icon left> mdi-plus </v-icon>
            Submit Record</v-btn
          >
          <v-btn color="primary" nuxt to="/leaderboard">
            <v-icon left> mdi-podium </v-icon>
            Leaderboard</v-btn
          >
        </v-card-actions>
      </v-card>
      <ReleaseHistory class="mt-3" />
    </v-container>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import ReleaseHistory from '~/components/common/releaseHistory.vue'
import { handleError } from '~/services/base'
import { getEvents } from '~/services/dropdown'

export default {
  components: {
    ReleaseHistory,
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
  },

  mounted() {
    // set a random image
    getEvents(this).then((events) => {
      const eventsWithBgImages = events.filter((event) => event.backgroundImage)

      if (eventsWithBgImages.length < 1) return

      this.$root.$emit('setBackgroundImage', {
        url: eventsWithBgImages[
          Math.floor(Math.random() * (eventsWithBgImages.length - 1))
        ].backgroundImage,
      })
    })
  },

  methods: {
    openCreateSubmissionDialog() {
      try {
        this.$root.$emit('openEditRecordDialog', {
          recordInfo: 'MySubmission',
          mode: 'add',
          selectedItem: {},
        })
      } catch (err) {
        handleError(this, err)
      }
    },
  },
  head() {
    return {
      title: 'Home',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'OSRSRecords.com',
        },
      ],
    }
  },
}
</script>

<style scoped>
.release {
  margin-bottom: 16px;
}
</style>
