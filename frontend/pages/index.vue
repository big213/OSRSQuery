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
        <v-card-title class="headline"> Welcome to OSRSQuery.com </v-card-title>
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

export default {
  components: {
    ReleaseHistory,
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
  },

  methods: {},
  head() {
    return {
      title: 'Home',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'OSRSQuery.com',
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
