import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Campaign from './models/Campaign.js';

dotenv.config();

const mockCampaigns = [
  {
    name: "Summer Coding Bootcamp", platform: "Meta", objective: "Lead Generation",
    budget: 15000, dailyBudget: 500, startDate: "2026-03-01", endDate: "2026-03-31",
    targetLocation: "Kolkata, Delhi", leadsGenerated: 95, costPerLead: 158,
    ageGroup: "18-30", educationLevel: "Graduate", interestCategory: "Technology", targetCity: "Kolkata",
    marketingManager: "u2", campaignOwner: "u2", campaignNotes: "Focus on coding bootcamp ads", approvalStatus: "Active",
    adSets: [
      { name: "Cold Audience - Tech", audienceType: "Cold", sourceAudience: "", retargetingSource: "", ads: [
        { adType: "Image", creativeHook: "Launch your tech career in 12 weeks", primaryMessage: "Full-stack bootcamp with placement support", cta: "Apply Now" },
      ] },
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
    marketingManager: "u2", campaignOwner: "u2", campaignNotes: "", approvalStatus: "Active",
    adSets: [], utmTracking: { utmSource: "google", utmMedium: "paid", utmCampaign: "ai-ml-push", utmContent: "", utmTerm: "data science course" },
    landingPages: [{ url: "https://redapple.com/data-science", pageVersion: "V1", conversionRate: 9.8 }],
  },
  {
    name: "Creative Design Sprint", platform: "LinkedIn", objective: "Course Promotion",
    budget: 8000, dailyBudget: 267, startDate: "2026-02-15", endDate: "2026-04-15",
    targetLocation: "Pan India", leadsGenerated: 55, costPerLead: 145,
    ageGroup: "18-28", educationLevel: "Graduate", interestCategory: "Design", targetCity: "Kolkata",
    marketingManager: "u2", campaignOwner: "u1", campaignNotes: "Promote Graphic Design, UI/UX, Motion Graphics", approvalStatus: "Active",
    adSets: [], utmTracking: { utmSource: "linkedin", utmMedium: "paid", utmCampaign: "design-sprint", utmContent: "", utmTerm: "" },
    landingPages: [],
  },
  {
    name: "Digital Marketing Course", platform: "Meta", objective: "Lead Generation",
    budget: 5000, dailyBudget: 167, startDate: "2026-03-20", endDate: "2026-04-20",
    targetLocation: "Kolkata", leadsGenerated: 35, costPerLead: 143,
    ageGroup: "20-30", educationLevel: "Any", interestCategory: "Marketing", targetCity: "Kolkata",
    marketingManager: "u2", campaignOwner: "u2", campaignNotes: "", approvalStatus: "Draft",
    adSets: [], utmTracking: { utmSource: "meta", utmMedium: "paid", utmCampaign: "dm-course", utmContent: "", utmTerm: "" },
    landingPages: [],
  },
];

const seedCampaigns = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding Campaigns...');

    await Campaign.deleteMany();
    await Campaign.insertMany(mockCampaigns);

    console.log('Campaigns Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedCampaigns();
