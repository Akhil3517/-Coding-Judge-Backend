const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
dotenv.config();

async function seedProblemsAndAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const { sampleProblems } = require('./models/Problem');
  await Problem.deleteMany({});
  await Problem.insertMany(sampleProblems);
  console.log('Sample problems seeded!');

  // Admin user seeding
  const adminEmail = 'admin@example.com';
  const adminPassword = 'adminpassword';
  const adminName = 'Admin';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });
    await admin.save();
    console.log('Admin user seeded!');
  } else {
    console.log('Admin user already exists.');
  }
  mongoose.disconnect();
}

seedProblemsAndAdmin().catch(err => {
  console.error(err);
  process.exit(1);
}); 