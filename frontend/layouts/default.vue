<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
      color="transparent"
    >
      <nuxt-link to="/" class="hidden-md-and-up">
        <v-img
          :src="require('../static/logo-trimmed.png')"
          class="ma-3"
          contain
        />
      </nuxt-link>
      <v-divider></v-divider>
      <v-list dense color="accent">
        <v-list-item class="mb-2">
          <v-btn
            block
            color="primary"
            class="pa-2"
            @click="openCreateSubmissionDialog()"
          >
            <v-icon left>mdi-plus</v-icon>
            Submit Record
          </v-btn>
        </v-list-item>
        <v-list-item
          v-for="(item, i) in mainItems"
          :key="i"
          :to="item.to"
          router
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list dense color="accent">
        <v-list-item
          v-for="(item, i) in visibleNavItems"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <!--
        <v-divider></v-divider>
      <v-list v-if="user" dense>
        <v-list-group prepend-icon="mdi-account" no-action>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>My Account</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="(item, i) in userItems"
            :key="i"
            :to="item.to"
            router
            exact
          >
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
      -->
      <v-divider></v-divider>
      <v-list v-if="isAdmin" dense color="accent">
        <v-list-item
          v-for="(item, i) in moderatorItems"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <AdminNavRoutes v-if="isAdmin" color="accent"></AdminNavRoutes>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app color="transparent">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <nuxt-link to="/" class="hidden-sm-and-down">
        <v-img
          :src="require('../static/logo-trimmed.png')"
          max-height="48"
          max-width="150"
          contain
        />
      </nuxt-link>
      <v-spacer />
      <v-chip v-if="isAttemptingLogin" pill>
        Loading...
        <v-progress-circular
          v-if="!user"
          class="ml-2"
          indeterminate
          size="16"
        ></v-progress-circular>
      </v-chip>
      <template v-else-if="user">
        <v-menu :close-on-content-click="true" :max-width="300" offset-y bottom>
          <template v-slot:activator="{ on }">
            <v-chip pill v-on="on">
              <v-avatar left>
                <v-img
                  v-if="firebaseUser.photoURL"
                  :src="firebaseUser.photoURL"
                ></v-img
                ><v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              {{ firebaseUser.displayName }}
              <v-progress-circular
                v-if="!user"
                class="ml-2"
                indeterminate
                size="16"
              ></v-progress-circular>
            </v-chip>
          </template>

          <v-card>
            <v-list>
              <v-list-item>
                <v-list-item-avatar>
                  <v-img
                    v-if="firebaseUser.photoURL"
                    :src="firebaseUser.photoURL"
                  />
                  <v-icon v-else>mdi-account</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{
                    firebaseUser.displayName
                  }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    firebaseUser.email
                  }}</v-list-item-subtitle>
                  <v-list-item-subtitle
                    >Role: <span v-if="user">{{ user.role }}</span
                    ><v-progress-circular
                      v-else
                      class="ml-2"
                      indeterminate
                      size="16"
                    ></v-progress-circular
                  ></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list dense>
              <v-list-item
                v-for="(item, i) in accountItems"
                :key="i"
                :to="item.to"
                exact
                nuxt
              >
                <v-list-item-content>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="logout()">
                <v-list-item-content>
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
      <v-btn v-else text nuxt to="/login" exact>
        <v-icon left>mdi-login</v-icon>
        Login
      </v-btn>
    </v-app-bar>
    <v-main :style="styleComputed">
      <nuxt />
    </v-main>
    <v-footer :absolute="!fixed" app>
      <VersionCheckText />
      <span>&nbsp;&copy; {{ new Date().getFullYear() }}</span>
      <v-spacer></v-spacer>
      <!--       <nuxt-link to="/legal/privacy" class="mr-2"> Privacy & Terms </nuxt-link> -->
      <v-icon small class="mr-2" @click="openLink('https://discord.gg/8U56ZZn')"
        >mdi-discord</v-icon
      >
      <v-icon
        small
        class="mr-2"
        @click="openLink('https://github.com/big213/OSRSRecords')"
        >mdi-github</v-icon
      >
      <v-icon
        small
        class="mr-2"
        title="hello@osrsrecords.com"
        @click="copyToClipboard('hello@osrsrecords.com')"
        >mdi-email</v-icon
      >
      <v-icon
        small
        class="mr-2"
        title="Toogle Brightness"
        @click="toggleTheme()"
        >mdi-brightness-4</v-icon
      >
    </v-footer>
    <Snackbar />
    <EditRecordDialog
      v-if="dialogs.editRecord"
      :record-info="editRecordDialogRecordInfo"
      :selected-item="dialogs.editRecord.selectedItem"
      :custom-fields="dialogs.editRecord.customFields"
      :special-mode="dialogs.editRecord.specialMode"
      :mode="dialogs.editRecord.mode"
      @close="dialogs.editRecord = null"
      @handleSubmit="handleItemAdded()"
    ></EditRecordDialog>
    <CrudRecordDialog
      v-if="dialogs.crudRecord"
      :record-info="crudRecordDialogRecordInfo"
      :locked-filters="dialogs.crudRecord.lockedFilters"
      :hidden-headers="dialogs.crudRecord.hiddenHeaders"
      :hidden-filters="dialogs.crudRecord.hiddenFilters"
      :page-options="dialogs.crudRecord.pageOptions"
      @close="dialogs.crudRecord = null"
    ></CrudRecordDialog>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import Snackbar from '~/components/snackbar/snackbar'
import VersionCheckText from '~/components/common/versionCheckText.vue'
import {
  copyToClipboard,
  openLink,
  handleError,
  generateCrudRecordInterfaceRoute,
} from '~/services/base'
import firebase from '~/services/fireinit'
import AdminNavRoutes from '~/components/navigation/adminNavRoutes.vue'
import 'firebase/auth'
import EditRecordDialog from '~/components/dialog/editRecordDialog.vue'
import CrudRecordDialog from '~/components/dialog/crudRecordDialog.vue'
import * as allModels from '~/models'

export default {
  components: {
    Snackbar,
    VersionCheckText,
    AdminNavRoutes,
    EditRecordDialog,
    CrudRecordDialog,
  },
  data() {
    return {
      clipped: true,
      drawer: true,
      fixed: true,

      dialogs: {
        editRecord: null,
        crudRecord: null,
      },

      mainItems: [
        {
          icon: 'mdi-home',
          title: 'Home',
          to: '/',
        },
      ],

      backgroundImage: null,
      navItems: [
        {
          icon: 'mdi-podium',
          title: 'Leaderboard',
          to: '/leaderboard',
          loginRequired: false,
        },
        {
          icon: 'mdi-seal',
          title: 'Latest Submissions',
          to: '/latest-submissions',
          loginRequired: false,
        },
        {
          icon: 'mdi-account',
          title: 'Characters',
          to: generateCrudRecordInterfaceRoute('/public-characters', {
            search: '',
            filters: [],
            sort: {
              field: 'createdAt',
              desc: true,
            },
          }),
          loginRequired: false,
        },
      ],
      userItems: [
        {
          icon: 'mdi-account',
          title: 'My Profile',
          to: '/my-profile?expand=0',
        },
        {
          icon: 'mdi-view-grid-plus',
          title: 'My Apps',
          to: '/my-apps',
        },
        {
          icon: 'mdi-file',
          title: 'My Files',
          to: '/my-files',
        },
      ],

      moderatorItems: [
        {
          icon: 'mdi-format-list-checkbox',
          title: 'Review Queue',
          to: generateCrudRecordInterfaceRoute('/submissions', {
            search: '',
            filters: [
              {
                field: 'status',
                operator: 'in',
                value: ['UNDER_REVIEW', 'SUBMITTED', 'INFORMATION_REQUESTED'],
              },
            ],
            sort: {
              field: 'createdAt',
              desc: true,
            },
          }),
        },
        {
          icon: 'mdi-checkbox-marked',
          title: 'Done',
          to: generateCrudRecordInterfaceRoute('/submissions', {
            search: '',
            filters: [
              {
                field: 'status',
                operator: 'in',
                value: ['APPROVED', 'REJECTED'],
              },
            ],
            sort: {
              field: 'updatedAt',
              desc: true,
            },
          }),
        },
      ],
      accountItems: [
        { title: 'My Profile', to: '/my-profile', exact: false },
        { title: 'Settings', to: '/settings', exact: false },
      ],
      miniVariant: false,
      title: 'OSRSRecords',
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
      firebaseUser: 'auth/firebaseUser',
      isAttemptingLogin: 'auth/isAttemptingLogin',
    }),
    visibleNavItems() {
      return this.navItems.filter(
        (item) => this.$store.getters['auth/user'] || !item.loginRequired
      )
    },

    editRecordDialogRecordInfo() {
      return this.dialogs.editRecord
        ? typeof this.dialogs.editRecord.recordInfo === 'string'
          ? allModels[this.dialogs.editRecord.recordInfo]
          : this.dialogs.editRecord.recordInfo
        : null
    },

    crudRecordDialogRecordInfo() {
      return this.dialogs.crudRecord
        ? typeof this.dialogs.crudRecord.recordInfo === 'string'
          ? allModels[this.dialogs.crudRecord.recordInfo]
          : this.dialogs.crudRecord.recordInfo
        : null
    },

    isAdmin() {
      return this.$store.getters['auth/user']?.role === 'ADMIN'
    },

    styleComputed() {
      return this.backgroundImage
        ? {
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.527),rgba(0, 0, 0, 0.5)), url(${this.backgroundImage})`,
            backgroundSize: 'cover',
            height: '100%',
          }
        : {}
    },
  },

  mounted() {
    this.drawer = this.$vuetify.breakpoint.name !== 'xs'

    /*
     ** Expecting recordInfo, selectedItem, mode, customFields?, specialMode?
     */
    this.$root.$on('openEditRecordDialog', (params) => {
      this.dialogs.editRecord = params
    })

    /*
     ** Expecting recordInfo, lockedFilters, title, icon, hiddenHeaders, hiddenFilters, pageOptions
     */
    this.$root.$on('openCrudRecordDialog', (params) => {
      this.dialogs.crudRecord = params
    })

    /*
     ** Expecting url
     */
    this.$root.$on('setBackgroundImage', (params) => {
      this.backgroundImage = params.url
    })
  },

  methods: {
    copyToClipboard(content) {
      return copyToClipboard(this, content)
    },
    openLink,

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

    handleItemAdded() {
      /*       switch (this.editRecordDialogRecordInfo.typename) {
        case 'workspace':
          break;
      } */
    },

    canSee(allowedRoles, allowedPermissions) {
      return (
        allowedRoles.includes(this.$store.getters['auth/user']?.role) ||
        allowedPermissions.some((ele) =>
          this.$store.getters['auth/user']?.allPermissions.includes(ele)
        )
      )
    },

    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      localStorage.setItem('theme', this.$vuetify.theme.dark ? 'dark' : 'light')
    },

    logout() {
      try {
        this.$router.push('/')

        firebase.auth().signOut()
      } catch (err) {
        handleError(this, err)
      }
    },
  },
}
</script>
