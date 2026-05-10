/**
 * firebase.js - Firebase Initialization for Admin Panel
 */
const FirebaseApp = (function () {
  let _db = null;
  let _auth = null;
  let _initialized = false;

  // Uses the same config as the main app
  const firebaseConfig = {
    apiKey: 'AIzaSyDHTnIhjlyLy6CGOeLHfAIjIX_Bd4kSfco',
    authDomain: 'quant-reflex-trainer.firebaseapp.com',
    projectId: 'quant-reflex-trainer',
    storageBucket: 'quant-reflex-trainer.firebasestorage.app',
    messagingSenderId: '438863369800',
    appId: '1:438863369800:web:eea1aa154fdd6d5d852a7d'
  };

  function init() {
    if (_initialized) return true;
    try {
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }
      _db = firebase.firestore();
      _auth = firebase.auth();
      _initialized = true;
      return true;
    } catch (e) {
      console.error('Firebase initialization failed:', e);
      return false;
    }
  }

  function getDb() { return _db; }
  function getAuth() { return _auth; }
  function isReady() { return _initialized; }

  return { init, getDb, getAuth, isReady };
})();
