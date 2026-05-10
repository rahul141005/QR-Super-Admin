const { withAdmin, db } = require('../_lib/firebase-admin');

module.exports = withAdmin(async function (req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const snapshot = await db.collection('questions').orderBy('createdAt', 'desc').limit(100).get();
    const questions = [];
    snapshot.forEach(function (doc) {
      questions.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ questions: questions });
  } catch (error) {
    console.error('[questions] Error:', error);
    res.status(500).json({ error: error.message });
  }
});
