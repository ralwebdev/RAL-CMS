import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const users = [
  {
    name: 'Shreya Chakraborty',
    email: 'shreya@redapple.com',
    password: 'telecaller123',
    role: 'telecaller',
  },
  {
    name: 'Priya Das',
    email: 'priya@redapple.com',
    password: 'telecaller123',
    role: 'telecaller',
  },
  {
    name: 'Manjari Chakraborty',
    email: 'manjari@redapple.com',
    password: 'counselor123',
    role: 'counselor',
  },
  {
    name: 'Soumya Saha',
    email: 'soumya@redapple.com',
    password: 'marketing123',
    role: 'marketing_manager',
  },
  {
    name: 'Amit Sharma',
    email: 'amit@redapple.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Rajesh Kapoor',
    email: 'rajesh@redapple.com',
    password: 'owner123',
    role: 'owner',
  },
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();

    const createPromises = users.map(user => new User(user).save());
    await Promise.all(createPromises);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
