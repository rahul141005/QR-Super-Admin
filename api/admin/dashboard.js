const { db, auth } = require('../_lib/firebase-admin');

export default async function handler(req, res) {
  // CORS & Auth verification (would normally abstract this into middleware)
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken.admin) return res.status(403).json({ error: 'Forbidden. Admin only.' });

    if (req.method === 'GET') {
      // In production, calculating these metrics dynamically might be expensive.
      // Typically, these would be aggregated via a cron job or Firestore triggers.
      // For this implementation, we simulate fetching aggregated data.
      
      const metricsDoc = await db.collection('admin').doc('metrics').get();
      let data = { totalUsers: 0, premiumUsers: 0, aiTokens: 0 };
      
      if (metricsDoc.exists) {
        data = metricsDoc.data();
      }

      res.status(200).json(data);
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
