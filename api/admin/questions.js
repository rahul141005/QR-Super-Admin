const { db, auth } = require('../_lib/firebase-admin');

export default async function handler(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken.admin) return res.status(403).json({ error: 'Forbidden. Admin only.' });

    if (req.method === 'GET') {
      const snapshot = await db.collection('questions').limit(100).get();
      const questions = [];
      snapshot.forEach(doc => {
        questions.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({ questions });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
