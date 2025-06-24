const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const auth = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only analytics and management
 */

/**
 * @swagger
 * /api/admin/top-problems:
 *   get:
 *     summary: Get the most successfully solved problems
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of the top 5 most solved problems.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   problemId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   count:
 *                     type: integer
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden (not an admin)
 */

router.get('/top-problems', auth, isAdmin, async (req, res) => {
  try {
    const topProblems = await Submission.aggregate([
      { $match: { verdict: 'Pass' } },
      { $group: { _id: '$problemId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      { $project: { _id: 0, problemId: '$_id', title: '$problem.title', count: 1 } }
    ]);
    res.json(topProblems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: An object containing platform statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalSubmissions:
 *                   type: integer
 *                 passRate:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden (not an admin)
 */

// GET /api/admin/stats - total users, total submissions, pass rate
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalPassed = await Submission.countDocuments({ verdict: 'Pass' });
    const passRate = totalSubmissions > 0 ? ((totalPassed / totalSubmissions) * 100).toFixed(2) : '0.00';
    res.json({ totalUsers, totalSubmissions, passRate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 