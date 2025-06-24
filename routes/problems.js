const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
// Placeholder for auth and isAdmin middleware
const auth = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

/**
 * @swagger
 * components:
 *   schemas:
 *     Problem:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - inputFormat
 *         - outputFormat
 *         - constraints
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         inputFormat:
 *           type: string
 *         outputFormat:
 *           type: string
 *         constraints:
 *           type: string
 *         sampleTestCases:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TestCase'
 *         hiddenTestCases:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TestCase'
 *     TestCase:
 *       type: object
 *       required:
 *         - input
 *         - output
 *       properties:
 *         input:
 *           type: string
 *         output:
 *           type: string
 *
 * @swagger
 * /api/problems:
 *   get:
 *     summary: List all problems
 *     tags: [Problems]
 *     responses:
 *       200:
 *         description: List of problems
 *   post:
 *     summary: Add a new problem (admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Problem'
 *     responses:
 *       201:
 *         description: Problem created
 *       400:
 *         description: Error
 * /api/problems/{id}:
 *   get:
 *     summary: Get problem details
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Problem details
 *       404:
 *         description: Problem not found
 *   put:
 *     summary: Update a problem (admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Problem'
 *     responses:
 *       200:
 *         description: Problem updated
 *       404:
 *         description: Problem not found
 */

router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const problem = new Problem(req.body);
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  const problems = await Problem.find();
  res.json(problems);
});

router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 