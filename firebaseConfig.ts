// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// // TODO: Replace the following with your app's Firebase project configuration
// // See: https://firebase.google.com/docs/web/learn-more#config-object
// // const firebaseConfig: FirebaseOptions = {
// //   apiKey: 'API_KEY',
// //   authDomain: 'PROJECT_ID.firebaseapp.com',
// //   // The value of `databaseURL` depends on the location of the database
// //   databaseURL: 'https://DATABASE_NAME.firebaseio.com',
// //   projectId: 'twit-snap',
// //   storageBucket: 'PROJECT_ID.appspot.com',
// //   messagingSenderId: 'SENDER_ID',
// //   appId: 'APP_ID'
// // };

// // Initialize Firebase
// const app = initializeApp();

// // Initialize Firebase Authentication and get a reference to the service
// const auth = getAuth(app);

// export { auth };

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  projectId: 'twit-snap',
  databaseURL: 'https://twit-snap-default-rtdb.firebaseio.com/',
  appId: '1:224360780470:android:a5de3fa25a47ac94814c17'
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
