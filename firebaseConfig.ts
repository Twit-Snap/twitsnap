import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAi70bL19-ZNS0OMOoxNS0kuoOtvflgrSA',
  authDomain: 'twit-snap.firebaseapp.com',
  projectId: 'twit-snap',
  storageBucket: 'twit-snap.firebasestorage.app',
  // storageBucket: 'twit-snap.appspot.com',
  messagingSenderId: '224360780470',
  appId: '1:224360780470:web:a5de3fa25a47ac94814c17'
};

export const initializeFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized');
  }
};

export { firebase };
