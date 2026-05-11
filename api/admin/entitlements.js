const { withAdmin, db } = require('../_lib/firebase-admin');

module.exports = withAdmin(async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, action, targetId } = req.body;
    // type: 'individual' | 'bulk'
    // action: 'trial' | 'premium' | 'premium_plus_6m' | 'premium_plus_1y' | 'revoke'
    // targetId: uid (if individual) or coachingId (if bulk)

    if (!type || !action || !targetId) {
      return res.status(400).json({ error: 'type, action, and targetId are required' });
    }

    let userDocs = [];

    if (type === 'individual') {
      const doc = await db.collection('users').doc(targetId).get();
      if (doc.exists) {
        userDocs.push(doc);
      }
    } else if (type === 'bulk') {
      const snapshot = await db.collection('users').where('coachingId', '==', targetId).get();
      snapshot.forEach(doc => userDocs.push(doc));
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    if (userDocs.length === 0) {
      return res.status(404).json({ error: 'No users found for targetId' });
    }

    // Determine payload based on action
    let payload = {};
    const now = Date.now();
    const updatedAt = new Date().toISOString();

    if (action === 'trial') {
      const trialEnd = now + 7 * 24 * 60 * 60 * 1000;
      payload = {
        isTrial: true,
        trialEnd: trialEnd,
        updatedAt
      };
    } else if (action === 'premium') {
      payload = {
        isPremium: true,
        hasPaid: true,
        isTrial: false,
        trialEnd: null,
        updatedAt
      };
    } else if (action === 'premium_plus_6m' || action === 'premium_plus_1y') {
      const plan = action === 'premium_plus_1y' ? 'plus_yearly' : 'plus_half_yearly';
      const days = action === 'premium_plus_1y' ? 365 : 180;
      const expiry = now + days * 24 * 60 * 60 * 1000;
      payload = {
        isPremiumPlus: true,
        premiumPlusPlan: plan,
        premiumPlusExpiry: expiry,
        premiumPlusStatus: 'active',
        updatedAt
      };
    } else if (action === 'revoke') {
      payload = {
        isPremium: false,
        isPremiumPlus: false,
        hasPaid: false,
        isTrial: false,
        trialEnd: null,
        premiumPlusExpiry: null,
        premiumPlusStatus: null,
        premiumPlusPlan: null,
        updatedAt
      };
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Process in batches (Firestore limit is 500 per batch)
    let batch = db.batch();
    let batchCount = 0;
    let totalUpdated = 0;

    for (let i = 0; i < userDocs.length; i++) {
      batch.set(userDocs[i].ref, payload, { merge: true });
      batchCount++;
      totalUpdated++;

      if (batchCount === 500) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    res.status(200).json({ success: true, updatedCount: totalUpdated });
  } catch (error) {
    console.error('[entitlements] Error:', error);
    res.status(500).json({ error: error.message });
  }
});
