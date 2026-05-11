const { withAdmin, db } = require('../_lib/firebase-admin');

module.exports = withAdmin(async function (req, res) {
  if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('coachings').orderBy('createdAt', 'desc').get();
      const coachings = [];
      snapshot.forEach(doc => {
        coachings.push({ id: doc.id, ...doc.data() });
      });
      return res.status(200).json({ coachings });
    } catch (error) {
      console.error('[coachings] GET Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { coachingId, name } = req.body;
      if (!coachingId || !name) {
        return res.status(400).json({ error: 'coachingId and name are required' });
      }

      const docRef = db.collection('coachings').doc(coachingId);
      const doc = await docRef.get();
      if (doc.exists) {
        return res.status(400).json({ error: 'Coaching ID already exists' });
      }

      const payload = {
        coachingId,
        name,
        status: 'active',
        studentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await docRef.set(payload);
      return res.status(200).json({ success: true, coaching: payload });
    } catch (error) {
      console.error('[coachings] POST Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
});
