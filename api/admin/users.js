const { db, auth } = require('../_lib/firebase-admin');

export default async function handler(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken.admin) return res.status(403).json({ error: 'Forbidden. Admin only.' });

    if (req.method === 'GET') {
      // List up to 100 users via Firebase Auth
      const listUsersResult = await auth.listUsers(100);
      
      const users = await Promise.all(listUsersResult.users.map(async (userRecord) => {
        // Fetch premium status from Firestore
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        let isPremium = false;
        if (userDoc.exists) {
          isPremium = userDoc.data().isPremium === true;
        }

        return {
          uid: userRecord.uid,
          email: userRecord.email,
          username: userRecord.displayName || 'Unknown',
          createdAt: userRecord.metadata.creationTime,
          isPremium: isPremium
        };
      }));

      res.status(200).json({ users });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
