const { db, auth } = require('../../../_lib/firebase-admin');

export default async function handler(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken.admin) return res.status(403).json({ error: 'Forbidden. Admin only.' });

    if (req.method === 'POST') {
      const { uid, isPremium } = req.body;
      if (!uid) return res.status(400).json({ error: 'Missing uid' });

      await db.collection('users').doc(uid).set({
        isPremium: !!isPremium
      }, { merge: true });

      res.status(200).json({ success: true, uid, isPremium });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
