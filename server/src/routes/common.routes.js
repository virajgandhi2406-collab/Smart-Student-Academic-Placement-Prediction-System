/**
 * EduPredict Common / Shared Routes
 * Handles user notifications and public university metadata.
 */

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { verifyToken } = require('../middleware/auth');

// Public metadata for registration dropdowns
router.get('/public-metadata', async (req, res) => {
  try {
    const departments = await db.institution.getDepartments();
    const courses = await db.institution.getCourses();
    const batches = await db.institution.getBatches();

    return res.json({
      success: true,
      departments,
      courses,
      batches
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load public metadata.' });
  }
});

// User Notifications (Authenticated)
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const notifs = await db.notifications.getByUser(req.user.id);
    return res.json({ success: true, notifications: notifs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
});

router.put('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const updated = await db.notifications.markRead(req.params.id);
    return res.json({ success: true, notification: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

module.exports = router;
