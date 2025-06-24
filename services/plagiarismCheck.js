const stringSimilarity = require('string-similarity');
const Submission = require('../models/Submission');

const PLAGIARISM_THRESHOLD = 0.7; 

/**
 * Checks a submission for plagiarism against other successful submissions for the same problem.
 * @param {object} currentSubmission - The Mongoose document of the submission to check.
 * @returns {Promise<object>} A promise that resolves to the plagiarism report.
 */
async function checkPlagiarism(currentSubmission) {
  try {
    // Find all other successful submissions for the same problem to compare against.
    const otherSubmissions = await Submission.find({
      problemId: currentSubmission.problemId,
      _id: { $ne: currentSubmission._id }, // Exclude the submission itself
      verdict: 'Pass'                      // Only compare against correct solutions
    });

    if (otherSubmissions.length === 0) {
      return { isFlagged: false }; 
    }

    const otherCodes = otherSubmissions.map(s => s.code);
    const mainCode = currentSubmission.code;
    const ratings = stringSimilarity.findBestMatch(mainCode, otherCodes);
    const bestMatch = ratings.bestMatch;

    if (bestMatch.rating > PLAGIARISM_THRESHOLD) {
      const mostSimilarSubmission = otherSubmissions[ratings.bestMatchIndex];
      return {
        isFlagged: true,
        mostSimilarSubmissionId: mostSimilarSubmission._id,
        similarityScore: bestMatch.rating
      };
    }

    return { isFlagged: false };
  } catch (error) {
    console.error("Error during plagiarism check:", error);
    return { isFlagged: false, error: "Plagiarism check failed" };
  }
}

module.exports = { checkPlagiarism }; 