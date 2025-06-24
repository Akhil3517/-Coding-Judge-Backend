const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const auth = require('../middleware/authMiddleware');
const { spawn } = require('child_process');
const { checkPlagiarism } = require('../services/plagiarismCheck');

/**
 * @swagger
 * /api/submit:
 *   post:
 *     summary: Submit code for a problem
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               problemId:
 *                 type: string
 *               language:
 *                 type: string
 *                 description: "Supported: python, cpp, java. For Java, always use 'public class Main' as the class name."
 *               code:
 *                 type: string
 *                 description: |
 *                   Your code as a string. 
 *                   
 *                   **Java users:** Always use `public class Main` as your class name. Example:
 *                   ```java
 *                   public class Main {
 *                       public static void main(String[] args) {
 *                           // your code here
 *                       }
 *                   }
 *                   ```
 *     responses:
 *       201:
 *         description: Submission created and evaluated. The response includes a `plagiarismReport` if the submission passed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Error (e.g., compilation error, problem not found)
 * /api/submissions/user/{id}:
 *   get:
 *     summary: Get all submissions by a user
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of submissions
 * /api/submissions/problem/{id}:
 *   get:
 *     summary: Get all submissions for a problem
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of submissions
 *
 * components:
 *   schemas:
 *     Submission:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         problemId:
 *           type: string
 *         language:
 *           type: string
 *         code:
 *           type: string
 *         status:
 *           type: string
 *         verdict:
 *           type: string
 *         output:
 *           type: string
 *         error:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         plagiarismReport:
 *           type: object
 *           properties:
 *             isFlagged:
 *               type: boolean
 *             mostSimilarSubmissionId:
 *               type: string
 *             similarityScore:
 *               type: number
 */

const languageConfigs = {
  python: {
    extension: 'py',
    runCmd: (file) => ['python', [file]],
  },
  cpp: {
    extension: 'cpp',
    compileCmd: (file, out) => ['g++', [file, '-o', out]],
    runCmd: (out) => [out, []],
  },
  java: {
    extension: 'java',
    compileCmd: (file) => ['javac', [file]],
    runCmd: () => ['java', ['Main']],
    fixedFile: 'Main.java',
  },
};


router.post('/', auth, async (req, res) => {
  const io = req.app.get('io');
  if (!req.user || !req.user.id) {
    console.error('Error: req.user or req.user.id is undefined in submission route.');
    return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
  }
  const userIdString = req.user.id.toString();
  console.log(`Received submission from user: ${userIdString}`);
  try {
    const { problemId, language, code } = req.body;
    const submission = new Submission({
      userId: req.user.id,
      problemId,
      language,
      code,
      status: 'Running',
    });
    await submission.save();
    console.log(`Emitting submissionStatus to room ${userIdString}: running`);
    io.to(userIdString).emit('submissionStatus', { submissionId: submission._id, status: 'running' });

    const problem = await Problem.findById(problemId);
    if (!problem) {
      submission.status = 'Error';
      submission.error = 'Problem not found';
      await submission.save();
      console.log(`Emitting submissionStatus to room ${userIdString}: error (Problem not found)`);
      io.to(userIdString).emit('submissionStatus', { submissionId: submission._id, status: 'error', error: 'Problem not found' });
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (!languageConfigs[language]) {
      submission.status = 'Error';
      submission.error = 'Language not supported';
      await submission.save();
      console.log(`Emitting submissionStatus to room ${userIdString}: error (Language not supported)`);
      io.to(userIdString).emit('submissionStatus', { submissionId: submission._id, status: 'error', error: 'Language not supported' });
      return res.status(400).json({ message: 'Language not supported' });
    }

    const fs = require('fs');
    const path = require('path');
    const { extension, compileCmd, runCmd, fixedFile } = languageConfigs[language];
    const tempDir = path.join(__dirname, '../temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const baseName = `sub_${submission._id}`;
    const tempFile = fixedFile ? path.join(tempDir, fixedFile) : path.join(tempDir, `${baseName}.${extension}`);
    fs.writeFileSync(tempFile, code);

    let allPassed = true;
    let outputLog = '';
    let errorLog = '';


    let compiled = true;
    let execFile = tempFile;
    let className = baseName;
    if (language === 'cpp') {
      execFile = path.join(tempDir, baseName + '_cpp_exe');
      const [cmd, args] = compileCmd(tempFile, execFile);
      const compile = spawn(cmd, args);
      let compileErr = '';
      compile.stderr.on('data', (data) => { compileErr += data.toString(); });
      await new Promise((resolve) => compile.on('close', resolve));
      if (compileErr) {
        compiled = false;
        errorLog += compileErr;
      }
    } else if (language === 'java') {
      const [cmd, args] = compileCmd(tempFile);
      const compile = spawn(cmd, args, { cwd: tempDir });
      let compileErr = '';
      compile.stderr.on('data', (data) => { compileErr += data.toString(); });
      await new Promise((resolve) => compile.on('close', resolve));
      if (compileErr) {
        compiled = false;
        errorLog += compileErr;
      }
    }

    if (!compiled) {
      submission.status = 'Error';
      submission.error = errorLog;
      await submission.save();
      console.log(`Emitting submissionStatus to room ${userIdString}: error (Compilation error)`);
      io.to(userIdString).emit('submissionStatus', { submissionId: submission._id, status: 'error', error: errorLog });
      try { fs.unlinkSync(tempFile); } catch {}
      return res.status(400).json({ message: 'Compilation error', error: errorLog });
    }

    for (const testCase of problem.hiddenTestCases.concat(problem.sampleTestCases)) {
      let cmd, args, options;
      if (language === 'python') {
        [cmd, args] = runCmd(tempFile);
        options = {};
      } else if (language === 'cpp') {
        [cmd, args] = runCmd(execFile);
        options = {};
      } else if (language === 'java') {
        [cmd, args] = runCmd();
        options = { cwd: tempDir };
      }
      const proc = spawn(cmd, args, options);
      let output = '';
      let error = '';
      proc.stdin.write((testCase.input || '') + '\n');
      proc.stdin.end();
      proc.stdout.on('data', (data) => { output += data.toString(); });
      proc.stderr.on('data', (data) => { error += data.toString(); });
      await new Promise((resolve) => proc.on('close', resolve));
      outputLog += `Input: ${testCase.input || ''}\nOutput: ${output}\nExpected: ${testCase.output}\n`;
      errorLog += error;
      if (output.trim() !== testCase.output.trim()) allPassed = false;
    }
    submission.status = 'Completed';
    submission.verdict = allPassed ? 'Pass' : 'Fail';
    
    // If the submission passed, run the plagiarism check
    if (allPassed) {
      const plagiarismReport = await checkPlagiarism(submission);
      submission.plagiarismReport = plagiarismReport;
    }

    submission.output = outputLog;
    submission.error = errorLog;
    await submission.save();
    console.log(`Emitting submissionStatus to room ${userIdString}: completed, verdict: ${submission.verdict}`);
    io.to(userIdString).emit('submissionStatus', { submissionId: submission._id, status: 'completed', verdict: submission.verdict });
    // Clean up
    try { fs.unlinkSync(tempFile); } catch {}
    if (language === 'cpp') { try { fs.unlinkSync(execFile); } catch {} }
    if (language === 'java') { try { fs.unlinkSync(path.join(tempDir, 'Main.class')); } catch {} }
    res.json(submission);
  } catch (err) {
    const io = req.app.get('io');
    const userIdForError = req.user && req.user.id ? req.user.id.toString() : 'unknown';
    console.log(`Emitting submissionStatus to room ${userIdForError}: error (catch block)`);
    io.to(userIdForError).emit('submissionStatus', { status: 'error', error: err.message });
    res.status(400).json({ message: err.message });
  }
});

// Get user submissions
router.get('/user/:id', auth, async (req, res) => {
  const submissions = await Submission.find({ userId: req.params.id });
  res.json(submissions);
});


router.get('/problem/:id', async (req, res) => {
  const submissions = await Submission.find({ problemId: req.params.id });
  res.json(submissions);
});

module.exports = router; 