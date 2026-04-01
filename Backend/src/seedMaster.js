import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Lead from './models/Lead.js';
import Campaign from './models/Campaign.js';
import CallLog from './models/CallLog.js';
import FollowUp from './models/FollowUp.js';
import Admission from './models/Admission.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const users = [
  { name: 'Shreya Chakraborty', email: 'shreya@redapple.com', password: 'password123', role: 'telecaller' },
  { name: 'Priya Das', email: 'priya@redapple.com', password: 'password123', role: 'telecaller' },
  { name: 'Manjari Chakraborty', email: 'manjari@redapple.com', password: 'password123', role: 'counselor' },
  { name: 'Soumya Saha', email: 'soumya@redapple.com', password: 'password123', role: 'marketing_manager' },
  { name: 'Amit Sharma', email: 'amit@redapple.com', password: 'password123', role: 'admin' },
  { name: 'Rajesh Kapoor', email: 'rajesh@redapple.com', password: 'password123', role: 'owner' },
];

const mockCampaigns = [
  {
    name: "Summer Coding Bootcamp", platform: "Meta", objective: "Lead Generation",
    budget: 15000, dailyBudget: 500, startDate: "2026-03-01", endDate: "2026-03-31",
    targetLocation: "Kolkata, Delhi", leadsGenerated: 95, costPerLead: 158,
    ageGroup: "18-30", educationLevel: "Graduate", interestCategory: "Technology", targetCity: "Kolkata",
    approvalStatus: "Active",
    adSets: [
      {
        name: "Cold Audience - Tech", audienceType: "Cold", sourceAudience: "", retargetingSource: "", ads: [
          { adType: "Image", creativeHook: "Launch your tech career in 12 weeks", primaryMessage: "Full-stack bootcamp with placement support", cta: "Apply Now" },
        ]
      },
    ],
    utmTracking: { utmSource: "meta", utmMedium: "paid", utmCampaign: "summer-bootcamp", utmContent: "image-ad-1", utmTerm: "coding bootcamp" },
    landingPages: [
      { url: "https://redapple.com/bootcamp", pageVersion: "V1", conversionRate: 12.5 },
      { url: "https://redapple.com/bootcamp-v2", pageVersion: "V2", conversionRate: 18.2 },
    ],
  },
  {
    name: "AI & Data Science Push", platform: "Google", objective: "Lead Generation",
    budget: 12000, dailyBudget: 400, startDate: "2026-03-10", endDate: "2026-04-10",
    targetLocation: "Kolkata, Bangalore", leadsGenerated: 70, costPerLead: 171,
    ageGroup: "22-35", educationLevel: "Post Graduate", interestCategory: "Data Science", targetCity: "Kolkata",
    approvalStatus: "Active",
    adSets: [], utmTracking: { utmSource: "google", utmMedium: "paid", utmCampaign: "ai-ml-push", utmContent: "", utmTerm: "data science course" },
    landingPages: [{ url: "https://redapple.com/data-science", pageVersion: "V1", conversionRate: 9.8 }],
  },
  {
    name: "Creative Design Sprint", platform: "LinkedIn", objective: "Course Promotion",
    budget: 8000, dailyBudget: 267, startDate: "2026-02-15", endDate: "2026-04-15",
    targetLocation: "Pan India", leadsGenerated: 55, costPerLead: 145,
    ageGroup: "18-28", educationLevel: "Graduate", interestCategory: "Design", targetCity: "Kolkata",
    approvalStatus: "Active",
    adSets: [], utmTracking: { utmSource: "linkedin", utmMedium: "paid", utmCampaign: "design-sprint", utmContent: "", utmTerm: "" },
    landingPages: [],
  },
];

const mockLeadsData = [
  { name: "Aarav Kumar", phone: "9876543210", email: "aarav@email.com", source: "Meta Ad", interestedCourse: "Full Stack Development", status: "New", createdAt: "2026-03-24", leadScore: 72, leadQuality: "Warm", budgetRange: "₹4.1L", urgencyLevel: "Medium", currentEducation: "B.Tech", graduationYear: "2025", currentOccupation: "Student", collegeInstitution: "VIT University", careerGoal: "Full Stack Developer", preferredStartTime: "Within 1 Month", intentScore: 70, intentCategory: "Medium Intent", temperature: "Warm", priorityScore: 72, priorityCategory: "High Priority" },
  { name: "Diya Singh", phone: "9876543211", email: "diya@email.com", source: "Google Ad", interestedCourse: "AI / ML", status: "Contacted", createdAt: "2026-03-23", leadScore: 85, leadQuality: "Hot", budgetRange: "₹2.6L", urgencyLevel: "High", otherInstitutes: "UpGrad", currentEducation: "M.Sc Statistics", graduationYear: "2024", currentOccupation: "Working Professional", careerGoal: "Data Scientist", preferredStartTime: "Immediate", intentScore: 88, intentCategory: "High Intent", temperature: "Hot", priorityScore: 92, priorityCategory: "High Priority" },
  { name: "Ananya Joshi", phone: "9876543213", email: "ananya@email.com", source: "Meta Ad", interestedCourse: "UI/UX Design", status: "Counseling", createdAt: "2026-03-21", leadScore: 90, leadQuality: "Hot", budgetRange: "₹90k", urgencyLevel: "High", currentEducation: "BCA", graduationYear: "2025", currentOccupation: "Student", collegeInstitution: "Christ University", careerGoal: "UI/UX Designer", preferredStartTime: "Immediate", intentScore: 92, intentCategory: "High Intent", temperature: "Hot", priorityScore: 95, priorityCategory: "High Priority" },
  { name: "Vihaan Sharma", phone: "9876543214", email: "vihaan@email.com", source: "Referral", interestedCourse: "Digital Marketing", status: "New", createdAt: "2026-03-25", leadScore: 45, leadQuality: "Cold", budgetRange: "₹50k", currentEducation: "B.Com", graduationYear: "2024", currentOccupation: "Job Seeker", careerGoal: "Digital Marketer", intentScore: 40, intentCategory: "Low Intent", temperature: "Cold", priorityScore: 40, priorityCategory: "Low Priority" },
  { name: "Isha Patel", phone: "9876543215", email: "isha@email.com", source: "YouTube", interestedCourse: "Full Stack Development", status: "Interested", createdAt: "2026-03-25", leadScore: 65, leadQuality: "Warm", budgetRange: "₹3L", currentEducation: "B.E", graduationYear: "2023", currentOccupation: "Software Trainee", careerGoal: "Senior Developer", intentScore: 68, intentCategory: "Medium Intent", temperature: "Warm", priorityScore: 60, priorityCategory: "Medium Priority" },
];

const seedAll = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // 1. Clear Collections
    await Admission.deleteMany({});
    await FollowUp.deleteMany({});
    await CallLog.deleteMany({});
    await Lead.deleteMany({});
    await Campaign.deleteMany({});
    await User.deleteMany({});

    console.log('Collections cleared.');

    // 2. Seed Users
    const hashedUsers = await Promise.all(users.map(async u => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      return { ...u, password: hashedPassword };
    }));

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} Users seeded with hashed passwords.`);

    const telecallerIds = createdUsers.filter(u => u.role === 'telecaller').map(u => u._id);
    const counselorIds = createdUsers.filter(u => u.role === 'counselor').map(u => u._id);
    const marketingMgrIds = createdUsers.filter(u => u.role === 'marketing_manager').map(u => u._id);
    const adminIds = createdUsers.filter(u => u.role === 'admin').map(u => u._id);

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 3. Seed Campaigns
    const campaignsToSeed = mockCampaigns.map(camp => ({
      ...camp,
      marketingManager: getRandom(marketingMgrIds),
      campaignOwner: getRandom(adminIds)
    }));
    const createdCampaigns = await Campaign.insertMany(campaignsToSeed);
    console.log(`${createdCampaigns.length} Campaigns seeded.`);
    const campaignIds = createdCampaigns.map(c => c._id);

    // 4. Seed Leads
    const leadsToSeed = mockLeadsData.map(lead => ({
      ...lead,
      campaignId: getRandom(campaignIds),
      assignedTelecallerId: getRandom(telecallerIds),
      assignedCounselor: getRandom(counselorIds),
      leadOwner: getRandom(adminIds)
    }));
    const createdLeads = await Lead.insertMany(leadsToSeed);
    console.log(`${createdLeads.length} Leads seeded.`);

    // 5. Seed interactions for some leads
    const sampleLead = createdLeads[0];
    const sampleTelecaller = getRandom(telecallerIds);

    await CallLog.create({
      leadId: sampleLead._id,
      telecallerId: sampleTelecaller,
      outcome: 'Interested',
      notes: 'Had a long discussion about the curriculum.',
      createdAt: new Date().toISOString()
    });

    await FollowUp.create({
      leadId: sampleLead._id,
      assignedTo: sampleTelecaller,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      notes: 'Call back to discuss fee structure.',
      completed: false
    });

    console.log('Interactions seeded.');
    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAll();
