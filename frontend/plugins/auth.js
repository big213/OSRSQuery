import { handleLogin, handleLogout } from '~/services/auth'
import firebase from '~/services/fireinit'
import 'firebase/auth'
import Cookies from 'js-cookie'

export default (context) => {
  const { store } = context

  return new Promise((resolve) => {
    // listen for auth state changes
    firebase.auth().onAuthStateChanged(async (firebaseAuthPayload) => {
      console.log('auth state changed')
      console.log(firebaseAuthPayload)
      if (firebaseAuthPayload === null) {
        handleLogout(store)
      } else {
        await handleLogin(store, firebaseAuthPayload)
      }

      // wait for the above actions to be finished before allowing main application to load
      resolve()
    })
  })
}
