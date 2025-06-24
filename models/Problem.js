const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String },
  output: { type: String, required: true }
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  inputFormat: { type: String, required: true },
  outputFormat: { type: String, required: true },
  constraints: { type: String, required: true },
  sampleTestCases: [testCaseSchema],
  hiddenTestCases: [testCaseSchema]
});

module.exports = mongoose.model('Problem', problemSchema);

module.exports.sampleProblems = [
  {
    title: 'Sum of Two Numbers',
    description: 'Given two integers, return their sum.',
    inputFormat: 'Two integers separated by space',
    outputFormat: 'Single integer',
    constraints: '1 <= a, b <= 1000',
    sampleTestCases: [
      { input: '2 3', output: '5' },
      { input: '10 20', output: '30' }
    ],
    hiddenTestCases: [
      { input: '100 200', output: '300' }
    ]
  },
  {
    title: 'Palindrome Number',
    description: 'Given an integer, determine if it is a palindrome. Print "true" if it is, otherwise print "false".',
    inputFormat: 'Single integer',
    outputFormat: 'true or false',
    constraints: '-2^31 <= n <= 2^31 - 1',
    sampleTestCases: [
      { input: '121', output: 'true' },
      { input: '-121', output: 'false' }
    ],
    hiddenTestCases: [
      { input: '12321', output: 'true' },
      { input: '10', output: 'false' }
    ]
  },
  {
    title: 'FizzBuzz',
    description: 'Given an integer n, print the numbers from 1 to n. But for multiples of three print "Fizz" instead of the number and for the multiples of five print "Buzz". For numbers which are multiples of both three and five print "FizzBuzz".',
    inputFormat: 'Single integer n',
    outputFormat: 'Print each value on a new line',
    constraints: '1 <= n <= 100',
    sampleTestCases: [
      { input: '5', output: '1\n2\nFizz\n4\nBuzz' }
    ],
    hiddenTestCases: [
      { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' }
    ]
  }
]; 