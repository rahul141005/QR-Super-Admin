const { auth } = require('./api/_lib/firebase-admin');

async function grantAdminRole(email, password) {
  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log(`User ${email} not found. Creating new user...`);
        user = await auth.createUser({
          email: email,
          password: password,
          emailVerified: true
        });
        console.log(`User created with UID: ${user.uid}`);
      } else {
        throw e;
      }
    }

    if (user.customClaims && user.customClaims.admin === true) {
      console.log(`User ${email} is already an admin.`);
      return;
    }
    
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`Success! Granted admin privileges to ${email}.`);
    console.log(`Please log out and log back in on the frontend to refresh your token.`);
    process.exit(0);
  } catch (error) {
    console.error("Error granting admin role:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.log("Usage: node make-admin.js <email> <password>");
  process.exit(1);
}

grantAdminRole(email, password);
