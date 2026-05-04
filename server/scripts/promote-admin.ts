import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/p2p-shipping';

async function promoteToAdmin(email: string) {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    user.role = 'ADMIN';
    await user.save();

    console.log(`\nSUCCESS: User "${user.name}" (${email}) is now an ADMIN.`);
    console.log(`You can now access the admin portal at /admin\n`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.log('\nUsage: npx ts-node scripts/promote-admin.ts <email>\n');
  process.exit(1);
}

promoteToAdmin(targetEmail);
