const { db, auth } = require('../_lib/firebase-admin');

export default async function handler(req, res) {
  // CORS & Auth verification (would normally abstract this into middleware)
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken.admin) return res.status(403).json({ error: 'Forbidden. Admin only.' });

    if (req.method === 'GET') {
      const usersCount = await db.collection('users').count().get();
      const totalUsers = usersCount.data().count;

      const premiumCount = await db.collection('users').where('isPremium', '==', true).count().get();
      const premiumUsers = premiumCount.data().count;

      res.status(200).json({ totalUsers, premiumUsers, aiTokens: 0 });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
