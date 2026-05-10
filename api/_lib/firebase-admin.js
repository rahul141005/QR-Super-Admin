const admin = require('firebase-admin');

if (!admin.apps.length) {
  // In Vercel, the service account is stored as an environment variable
  // e.g. FIREBASE_SERVICE_ACCOUNT which is a stringified JSON
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
      // Initialize without credentials (might fail if not using default application credentials)
      admin.initializeApp();
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
