import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './models/Lead.js';

dotenv.config();

const mockLeads = [
  {
    name: "Aarav Kumar", phone: "9876543210", email: "aarav@email.com", source: "Meta Ad", campaignId: "c1",
    interestedCourse: "Full Stack Development", assignedTelecallerId: "u3", status: "New", createdAt: "2026-03-24",
    adSetName: "Cold Audience - Tech", adName: "Image Ad 1", landingPageUrl: "https://redapple.com/bootcamp",
    utm: { utmSource: "meta", utmMedium: "paid", utmCampaign: "summer-bootcamp", utmContent: "image-ad-1", utmTerm: "coding bootcamp" },
    leadScore: 72, leadQuality: "Warm", budgetRange: "₹4.1L", urgencyLevel: "Medium",
    currentEducation: "B.Tech", graduationYear: "2025", currentOccupation: "Student", collegeInstitution: "VIT University",
    feePayer: "Parent", decisionMaker: "Joint", highestQualification: "B.Tech", currentStatus: "Student", careerGoal: "Full Stack Developer", preferredStartTime: "Within 1 Month",
    leadSourceFormType: "Apply Now", leadMotivation: "Job Placement", placementInterest: true, expectedSalary: "5 LPA", jobLocationPreference: "Kolkata",
    intentScore: 70, intentCategory: "Medium Intent", temperature: "Warm", assignedCounselor: "u5", leadOwner: "u3",
    activities: [
      { type: "Lead Created", description: "Lead captured from Meta Ad — Apply Now form", timestamp: "2026-03-24T10:00:00" },
      { type: "Call Attempted", description: "First call attempt by Shreya", channel: "Phone Call", userId: "u3", timestamp: "2026-03-24T11:30:00" },
    ],
    qualification: { budgetConfirmed: false, courseInterestConfirmed: true, locationPreference: true, startTimeline: false, placementExpectation: true },
    qualificationScore: 60, recommendedCourse: "Full Stack Development", alternateCourse: "Web Design",
    recommendationReason: "Strong interest in web development", priorityScore: 72, priorityCategory: "High Priority",
  },
  {
    name: "Diya Singh", phone: "9876543211", email: "diya@email.com", source: "Google Ad", campaignId: "c2",
    interestedCourse: "AI / ML", assignedTelecallerId: "u3", status: "Contacted", createdAt: "2026-03-23",
    leadScore: 85, leadQuality: "Hot", budgetRange: "₹2.6L", urgencyLevel: "High", otherInstitutes: "UpGrad",
    currentEducation: "M.Sc Statistics", graduationYear: "2024", currentOccupation: "Working Professional",
    feePayer: "Self", decisionMaker: "Self", highestQualification: "M.Sc", currentStatus: "Working Professional", careerGoal: "Full Stack Developer", preferredStartTime: "Immediate",
    leadSourceFormType: "Free Counselling", leadMotivation: "Career Switch", placementInterest: true, expectedSalary: "8 LPA", jobLocationPreference: "Kolkata, Bangalore",
    intentScore: 88, intentCategory: "High Intent", temperature: "Hot", assignedCounselor: "u5", leadOwner: "u3",
    activities: [
      { type: "Lead Created", description: "Lead from Google search ad — Free Counselling", timestamp: "2026-03-23T09:00:00" },
      { type: "Call Connected", description: "Discussed placement support", channel: "Phone Call", userId: "u3", timestamp: "2026-03-23T10:15:00" },
    ],
    qualification: { budgetConfirmed: true, courseInterestConfirmed: true, locationPreference: true, startTimeline: true, placementExpectation: true },
    qualificationScore: 100, recommendedCourse: "AI / ML", alternateCourse: "Full Stack Development",
    priorityScore: 92, priorityCategory: "High Priority", admissionProbability: "High",
    firstCallTime: "2026-03-23T09:45:00", firstResponseTime: "2026-03-23T10:15:00",
  },
  {
    name: "Ananya Joshi", phone: "9876543213", email: "ananya@email.com", source: "Meta Ad", campaignId: "c1",
    interestedCourse: "UI/UX Design", assignedTelecallerId: "u4", status: "Counseling", createdAt: "2026-03-21",
    leadScore: 90, leadQuality: "Hot", budgetRange: "₹90k", urgencyLevel: "High",
    currentEducation: "BCA", graduationYear: "2025", currentOccupation: "Student", collegeInstitution: "Christ University",
    feePayer: "Parent", decisionMaker: "Joint", highestQualification: "BCA", currentStatus: "Student", careerGoal: "UI/UX Designer", preferredStartTime: "Immediate",
    leadSourceFormType: "Free Callback", leadMotivation: "Portfolio Building", placementInterest: true, expectedSalary: "4 LPA", jobLocationPreference: "Kolkata",
    intentScore: 92, intentCategory: "High Intent", temperature: "Hot", assignedCounselor: "u5", leadOwner: "u5",
    walkInStatus: "Completed", walkInDate: "2026-03-24", walkInTime: "14:00", walkInCounselor: "u5", counselingOutcome: "Strong Admission Intent",
    expectedDOJ: "2026-03-28", feeCommitment: "Full Admission Fee", documentStatus: "Documents Pending",
    documentsChecklist: { idProof: true, addressProof: false, educationCertificate: true, photographs: false },
    transferHistory: [{ fromUserId: "u4", toUserId: "u5", reason: "Course specialization", timestamp: "2026-03-22T16:00:00" }],
    activities: [
      { type: "Lead Created", description: "Lead from Meta Ad — Free Callback", timestamp: "2026-03-21T09:00:00" },
      { type: "Call Connected", description: "Very interested, wants counseling", channel: "Phone Call", userId: "u4", timestamp: "2026-03-21T11:00:00" },
    ],
    qualification: { budgetConfirmed: true, courseInterestConfirmed: true, locationPreference: true, startTimeline: true, placementExpectation: true },
    qualificationScore: 100, recommendedCourse: "UI/UX Design", alternateCourse: "Graphic Design",
    priorityScore: 95, priorityCategory: "High Priority", admissionProbability: "High",
  }
];

const seedLeads = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding Leads...');

    await Lead.deleteMany();
    await Lead.insertMany(mockLeads);

    console.log('Leads Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedLeads();
