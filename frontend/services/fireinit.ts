import firebase from 'firebase/app'

const config = {
  apiKey: 'AIzaSyCdGPyPKO2TO_rT7rLxO4rEyVNq6pXKFE8',
  authDomain: 'osrsquery.com',
  projectId: 'osrsquery',
  storageBucket: 'osrsquery.appspot.com',
}

!firebase.apps?.length && firebase.initializeApp(config)

// export const DB = firebase.database()

export default firebase
