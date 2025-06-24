const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem');
dotenv.config();

async function seedProblems() {
  await mongoose.connect(process.env.MONGO_URI);
  const { sampleProblems } = require('./models/Problem');
  await Problem.deleteMany({});
  await Problem.insertMany(sampleProblems);
  console.log('Sample problems seeded!');
  mongoose.disconnect();
}

seedProblems().catch(err => {
  console.error(err);
  process.exit(1);
}); 