import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// import { SOCKET_URL as BASE_URL } from "../../constants/config";
const BASE_URL = "http://172.20.10.3:3000";
// ── Design tokens ──────────────────────────────────────────────────────────
const TEAL = "#867795";
const TEAL_LIGHT = "#e9def5";
const TEAL_MID = "#867795";
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#ffffff";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#e5e7eb";
const INPUT_BG = "#f8fafa";
const GREEN_SUC = "#16A34A";
const GREEN_SUC_L = "#F0FDF4";
const WHITE = "#FFFFFF";

// ── Helpers ────────────────────────────────────────────────────────────────
const getImageUri = (image) => {
  if (image) {
    if (image.startsWith("http://") || image.startsWith("https://"))
      return image;
    const cleanImage = image.replace(/^uploads\//, "");
    return `${BASE_URL}/uploads/${cleanImage}`;
  }
  return "https://via.placeholder.com/150";
};

// ── Domain-specific skills ─────────────────────────────────────────────────
const DOMAIN_SKILLS_MAP = {
  "Career Counseling": [
    "Career Coaching",
    "Resume Writing",
    "LinkedIn Optimization",
    "Mock Interviews",
    "Group Discussion",
    "Aptitude Training",
    "Soft Skills",
    "Communication Skills",
    "Body Language",
    "Goal Setting",
    "Motivation & Mindset",
    "Personality Assessment",
  ],
  "Software Engineering": [
    "React",
    "React Native",
    "Next.js",
    "Vue.js",
    "Angular",
    "Node.js",
    "Express.js",
    "Django",
    "FastAPI",
    "Spring Boot",
    "Flutter",
    "Android (Kotlin)",
    "iOS (Swift)",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "GraphQL",
    "System Design",
    "DSA",
    "Git & GitHub",
    "Cybersecurity",
    "Blockchain",
    "Unity (Game Dev)",
  ],
  "Data Science & AI": [
    "Python",
    "R",
    "SQL",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Keras",
    "Power BI",
    "Tableau",
    "Excel (Advanced)",
    "Spark",
    "Hadoop",
    "Feature Engineering",
    "Model Deployment",
    "MLflow",
    "OpenAI API",
    "LangChain",
    "Prompt Engineering",
    "Statistics & Probability",
    "A/B Testing",
  ],
  "Finance & Investment": [
    "Stock Analysis (Technical)",
    "Stock Analysis (Fundamental)",
    "Mutual Fund Planning",
    "Portfolio Management",
    "Tax Planning",
    "GST Filing",
    "Income Tax Returns",
    "Financial Modeling (Excel)",
    "Valuation",
    "Crypto Trading",
    "Forex Trading",
    "Options & Futures",
    "Insurance Planning",
    "Tally",
    "Zoho Books",
    "CA / CFA / CFP Knowledge",
  ],
  "Marketing & Branding": [
    "SEO",
    "Google Ads",
    "Meta Ads (Facebook/Instagram)",
    "Content Writing",
    "Copywriting",
    "Email Marketing",
    "Canva",
    "Adobe Photoshop",
    "Adobe Premiere Pro",
    "Google Analytics",
    "HubSpot",
    "Mailchimp",
    "YouTube Marketing",
    "Influencer Outreach",
    "Brand Strategy",
    "Market Research",
    "WhatsApp Marketing",
    "Affiliate Marketing",
  ],
  "Health & Wellness": [
    "Nutrition Planning",
    "Diet Charting",
    "Weight Management",
    "Yoga",
    "Pranayama",
    "Meditation",
    "Zumba",
    "CrossFit",
    "Ayurvedic Consultation",
    "Physiotherapy Exercises",
    "Mental Health Counseling",
    "CBT Therapy",
    "First Aid & CPR",
    "Sports Nutrition",
    "Homeopathy",
    "Child Nutrition",
    "Naturopathy",
  ],
  "Legal Advisory": [
    "Contract Drafting",
    "Legal Research",
    "Case Filing",
    "IP Registration",
    "Trademark",
    "Patent",
    "GST & Tax Law",
    "Labour Law",
    "Consumer Law",
    "Company Incorporation",
    "MCA Filings",
    "Cyber Law",
    "Property Law",
    "Family Law",
    "Arbitration & Mediation",
    "Legal Document Review",
  ],
  "Business Strategy": [
    "Business Plan Writing",
    "Market Research",
    "Financial Projections",
    "Pitch Deck Creation",
    "SWOT & PESTLE Analysis",
    "OKR Framework",
    "Agile & Scrum",
    "PMP Certification",
    "Operations Optimization",
    "Supply Chain",
    "CRM Strategy",
    "SAP / Oracle ERP",
    "Product Roadmap",
    "Go-to-Market Strategy",
    "Fundraising Strategy",
    "Startup Mentoring",
  ],
  "Education & Tutoring": [
    "Mathematics (Class 8-12)",
    "Physics",
    "Chemistry",
    "Biology",
    "English Grammar",
    "Essay Writing",
    "JEE Preparation",
    "NEET Preparation",
    "UPSC Preparation",
    "Vedic Maths",
    "Abacus",
    "Scratch (Kids Coding)",
    "Python for Beginners",
    "Accountancy",
    "Economics",
    "Marathi Literature",
    "Hindi Literature",
    "Music (Vocal/Instrumental)",
    "Drawing & Painting",
    "Cricket Coaching",
    "Football Coaching",
  ],
  "Human Resources": [
    "Recruitment & Sourcing",
    "LinkedIn Hiring",
    "ATS Tools (Naukri/LinkedIn)",
    "HR Policies & Compliance",
    "Payroll Management",
    "HRMS Tools (Keka/Darwinbox/SAP)",
    "Performance Appraisal",
    "Employee Engagement",
    "Training & Development",
    "Labor Law",
    "Diversity & Inclusion",
    "HR Analytics",
    "Leadership Training",
    "Conflict Resolution",
  ],
  "Civil Services & Government": [
    "General Studies (GS Paper 1-4)",
    "CSAT",
    "Essay Writing",
    "Current Affairs",
    "Indian Polity & Constitution",
    "Indian Economy",
    "History & Culture",
    "Geography",
    "Banking Awareness",
    "Quantitative Aptitude",
    "Reasoning Ability",
    "English (Descriptive)",
    "Marathi (Descriptive)",
    "UPSC Interview Preparation",
  ],
  "Architecture & Design": [
    "AutoCAD",
    "Revit",
    "SketchUp",
    "Rhino 3D",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Adobe InDesign",
    "Figma",
    "Adobe XD",
    "3ds Max",
    "Blender",
    "V-Ray Rendering",
    "Interior Space Planning",
    "Landscape Design",
    "UI/UX Research",
    "Wireframing & Prototyping",
    "Fashion Illustration",
    "Textile Design",
  ],
  "Media & Journalism": [
    "News Writing",
    "Feature Writing",
    "Investigative Journalism",
    "Video Editing (Premiere Pro)",
    "Video Editing (DaVinci)",
    "Photography (DSLR)",
    "YouTube Content Creation",
    "Podcast Production",
    "Script Writing",
    "Adobe Audition",
    "Final Cut Pro",
    "Social Media Management",
    "Fact Checking",
    "Interviewing Techniques",
  ],
  "Agriculture & Farming": [
    "Organic Farming Techniques",
    "Soil Testing",
    "Drip Irrigation",
    "Hydroponics Setup",
    "Crop Disease Management",
    "Pesticide Management",
    "Government Agri Schemes",
    "Agri Export & Marketing",
    "Dairy Management",
    "Poultry Farming",
    "Horticulture",
    "Farm Accounting",
    "Agri Drone Technology",
  ],
  "Hospitality & Tourism": [
    "Front Office Operations",
    "Housekeeping Management",
    "Food & Beverage Service",
    "Culinary Skills",
    "Event Planning",
    "Tour Package Design",
    "Travel Agency Operations",
    "Hotel Revenue Management",
    "Customer Service",
    "GDS - Amadeus/Galileo",
    "Restaurant Management",
    "Bartending & Mixology",
  ],
};

const SKILL_OPTIONS = [
  "React",
  "React Native",
  "Node.js",
  "Python",
  "Java",
  "Angular",
  "Vue.js",
  "DevOps",
  "UI/UX Design",
  "Data Analysis",
  "Machine Learning",
  "PHP",
  "Laravel",
  "Django",
  "Flutter",
  "Marathi Teacher",
  "English Teacher",
  "Mathematics",
  "Science",
  "Other",
];

// ── Subdomain → skill auto-suggestions ────────────────────────────────────
const SUBDOMAIN_SKILLS_MAP = {
  "Frontend Development": [
    "React",
    "Vue.js",
    "Angular",
    "Next.js",
    "HTML/CSS",
    "TypeScript",
  ],
  "Backend Development": [
    "Node.js",
    "Express.js",
    "Django",
    "FastAPI",
    "Spring Boot",
    "PostgreSQL",
  ],
  "Full Stack Development": [
    "React",
    "Node.js",
    "Next.js",
    "MongoDB",
    "PostgreSQL",
    "Docker",
  ],
  "Mobile App Development": [
    "React Native",
    "Flutter",
    "Android (Kotlin)",
    "iOS (Swift)",
    "Expo",
  ],
  "System Design & Architecture": [
    "System Design",
    "Microservices",
    "Docker",
    "Kubernetes",
    "Redis",
  ],
  "DevOps & CI/CD": [
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git & GitHub",
  ],
  "Cloud Computing": [
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Terraform",
  ],
  Cybersecurity: [
    "Cybersecurity",
    "Ethical Hacking",
    "Network Security",
    "Pen Testing",
  ],
  "Blockchain Development": [
    "Blockchain",
    "Solidity",
    "Web3.js",
    "Ethereum",
    "Smart Contracts",
  ],
  "Game Development": [
    "Unity (Game Dev)",
    "C#",
    "Unreal Engine",
    "C++",
    "Blender",
  ],
  "API & Microservices": [
    "Node.js",
    "FastAPI",
    "GraphQL",
    "REST API",
    "Microservices",
    "Docker",
  ],
  "Machine Learning": [
    "Python",
    "Scikit-learn",
    "TensorFlow",
    "Feature Engineering",
    "Statistics & Probability",
  ],
  "Deep Learning": ["TensorFlow", "PyTorch", "Keras", "Python", "NumPy"],
  "Natural Language Processing": [
    "Python",
    "LangChain",
    "OpenAI API",
    "Prompt Engineering",
    "NLP",
  ],
  "Computer Vision": ["Python", "OpenCV", "TensorFlow", "PyTorch", "YOLO"],
  "Data Analytics": [
    "Python",
    "SQL",
    "Power BI",
    "Tableau",
    "Excel (Advanced)",
  ],
  "Data Engineering": ["Python", "Spark", "Hadoop", "SQL", "Airflow"],
  "Generative AI & LLMs": [
    "OpenAI API",
    "LangChain",
    "Prompt Engineering",
    "Python",
    "Hugging Face",
  ],
  "Business Intelligence": [
    "Power BI",
    "Tableau",
    "SQL",
    "Excel (Advanced)",
    "Data Visualization",
  ],
  "Stock Market & Trading": [
    "Stock Analysis (Technical)",
    "Stock Analysis (Fundamental)",
    "Options & Futures",
    "Crypto Trading",
  ],
  "Tax Planning & Filing": [
    "Tax Planning",
    "GST Filing",
    "Income Tax Returns",
    "Tally",
    "Zoho Books",
  ],
  "Financial Modeling": [
    "Financial Modeling (Excel)",
    "Valuation",
    "Excel (Advanced)",
    "CA / CFA / CFP Knowledge",
  ],
  "Digital Marketing": [
    "SEO",
    "Google Ads",
    "Meta Ads (Facebook/Instagram)",
    "Google Analytics",
    "HubSpot",
  ],
  "SEO & SEM": [
    "SEO",
    "Google Ads",
    "Google Analytics",
    "Content Writing",
    "Keyword Research",
  ],
  "Social Media Marketing": [
    "Meta Ads (Facebook/Instagram)",
    "Canva",
    "Content Writing",
    "YouTube Marketing",
    "Influencer Outreach",
  ],
  "Content Marketing": [
    "Content Writing",
    "Copywriting",
    "SEO",
    "Email Marketing",
    "Canva",
  ],
  "Resume & LinkedIn Building": [
    "Resume Writing",
    "LinkedIn Optimization",
    "Personal Branding",
    "Cover Letter",
  ],
  "Interview Preparation": [
    "Mock Interviews",
    "Communication Skills",
    "Body Language",
    "Group Discussion",
  ],
  "Personality Development": [
    "Soft Skills",
    "Communication Skills",
    "Body Language",
    "Motivation & Mindset",
  ],
  Mathematics: [
    "Mathematics (Class 8-12)",
    "Vedic Maths",
    "Abacus",
    "Statistics & Probability",
  ],
  "Competitive Exams (JEE/NEET/UPSC)": [
    "JEE Preparation",
    "NEET Preparation",
    "UPSC Preparation",
    "Current Affairs",
  ],
  "Coding for Kids & Beginners": [
    "Scratch (Kids Coding)",
    "Python for Beginners",
    "HTML/CSS",
    "Abacus",
  ],
  "Nutrition & Dietetics": [
    "Nutrition Planning",
    "Diet Charting",
    "Weight Management",
    "Sports Nutrition",
    "Child Nutrition",
  ],
  "Fitness & Personal Training": [
    "CrossFit",
    "Zumba",
    "Weight Management",
    "Sports Nutrition",
  ],
  "Yoga & Meditation": [
    "Yoga",
    "Pranayama",
    "Meditation",
    "Ayurvedic Consultation",
  ],
  "Talent Acquisition & Recruitment": [
    "Recruitment & Sourcing",
    "LinkedIn Hiring",
    "ATS Tools (Naukri/LinkedIn)",
    "HR Analytics",
  ],
  "HR Operations & Compliance": [
    "HR Policies & Compliance",
    "Payroll Management",
    "HRMS Tools (Keka/Darwinbox/SAP)",
    "Labor Law",
  ],
  "UI/UX Design": [
    "Figma",
    "Adobe XD",
    "Wireframing & Prototyping",
    "UI/UX Research",
    "Adobe Illustrator",
  ],
  "Graphic Design": [
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Canva",
    "Adobe InDesign",
  ],
  "Corporate & Company Law": [
    "Contract Drafting",
    "Company Incorporation",
    "MCA Filings",
    "Legal Research",
  ],
  "Tax & GST Law": [
    "GST & Tax Law",
    "GST Filing",
    "Tax Planning",
    "Legal Research",
  ],
};

const PREFERRED_JOB_OPTIONS = [
  { label: "Software Developer", value: "Software Developer" },
  { label: "Frontend Developer", value: "Frontend Developer" },
  { label: "Backend Developer", value: "Backend Developer" },
  { label: "Full Stack Developer", value: "Full Stack Developer" },
  { label: "Mobile App Developer", value: "Mobile App Developer" },
  { label: "Data Analyst", value: "Data Analyst" },
  { label: "Data Scientist", value: "Data Scientist" },
  { label: "Machine Learning Engineer", value: "Machine Learning Engineer" },
  { label: "DevOps Engineer", value: "DevOps Engineer" },
  { label: "UI/UX Designer", value: "UI/UX Designer" },
  { label: "Product Manager", value: "Product Manager" },
  { label: "Business Analyst", value: "Business Analyst" },
  { label: "Digital Marketer", value: "Digital Marketer" },
  { label: "Content Writer", value: "Content Writer" },
  { label: "HR Executive", value: "HR Executive" },
  { label: "Finance Analyst", value: "Finance Analyst" },
  { label: "Sales Executive", value: "Sales Executive" },
  { label: "Graphic Designer", value: "Graphic Designer" },
  { label: "Teacher / Trainer", value: "Teacher / Trainer" },
  { label: "Legal Associate", value: "Legal Associate" },
  { label: "Other", value: "Other" },
];

const CURRENT_STATUS_OPTIONS = [
  { label: "Student", value: "Student" },
  { label: "Fresher", value: "Fresher" },
  { label: "Working Professional", value: "Working Professional" },
  { label: "Looking for Job", value: "Looking for Job" },
  { label: "Freelancer", value: "Freelancer" },
  { label: "Entrepreneur", value: "Entrepreneur" },
];

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Punjabi",
  "Urdu",
  "Other",
];

const DOMAIN_OPTIONS = [
  { label: "Career Counseling", value: "Career Counseling" },
  { label: "Software Engineering", value: "Software Engineering" },
  { label: "Data Science & AI", value: "Data Science & AI" },
  { label: "Finance & Investment", value: "Finance & Investment" },
  { label: "Marketing & Branding", value: "Marketing & Branding" },
  { label: "Health & Wellness", value: "Health & Wellness" },
  { label: "Legal Advisory", value: "Legal Advisory" },
  { label: "Business Strategy", value: "Business Strategy" },
  { label: "Education & Tutoring", value: "Education & Tutoring" },
  { label: "Human Resources", value: "Human Resources" },
  {
    label: "Civil Services & Government",
    value: "Civil Services & Government",
  },
  { label: "Architecture & Design", value: "Architecture & Design" },
  { label: "Media & Journalism", value: "Media & Journalism" },
  { label: "Agriculture & Farming", value: "Agriculture & Farming" },
  { label: "Hospitality & Tourism", value: "Hospitality & Tourism" },
];

const SUBDOMAIN_MAP = {
  "Career Counseling": [
    {
      label: "Resume & LinkedIn Building",
      value: "Resume & LinkedIn Building",
    },
    { label: "Interview Preparation", value: "Interview Preparation" },
    { label: "Career Switch Guidance", value: "Career Switch Guidance" },
    { label: "Job Search Strategy", value: "Job Search Strategy" },
    { label: "Salary Negotiation", value: "Salary Negotiation" },
    {
      label: "College Admission Counseling",
      value: "College Admission Counseling",
    },
    { label: "Study Abroad Guidance", value: "Study Abroad Guidance" },
    { label: "Scholarship Guidance", value: "Scholarship Guidance" },
    { label: "Freshers Career Planning", value: "Freshers Career Planning" },
    { label: "Personality Development", value: "Personality Development" },
  ],
  "Software Engineering": [
    { label: "Frontend Development", value: "Frontend Development" },
    { label: "Backend Development", value: "Backend Development" },
    { label: "Full Stack Development", value: "Full Stack Development" },
    { label: "Mobile App Development", value: "Mobile App Development" },
    {
      label: "System Design & Architecture",
      value: "System Design & Architecture",
    },
    { label: "DevOps & CI/CD", value: "DevOps & CI/CD" },
    { label: "Cloud Computing", value: "Cloud Computing" },
    { label: "Cybersecurity", value: "Cybersecurity" },
    { label: "Blockchain Development", value: "Blockchain Development" },
    { label: "Game Development", value: "Game Development" },
    { label: "Embedded Systems", value: "Embedded Systems" },
    { label: "API & Microservices", value: "API & Microservices" },
  ],
  "Data Science & AI": [
    { label: "Machine Learning", value: "Machine Learning" },
    { label: "Deep Learning", value: "Deep Learning" },
    {
      label: "Natural Language Processing",
      value: "Natural Language Processing",
    },
    { label: "Computer Vision", value: "Computer Vision" },
    { label: "Data Analytics", value: "Data Analytics" },
    { label: "Data Engineering", value: "Data Engineering" },
    { label: "MLOps", value: "MLOps" },
    { label: "Business Intelligence", value: "Business Intelligence" },
    { label: "Generative AI & LLMs", value: "Generative AI & LLMs" },
    { label: "AI Ethics & Governance", value: "AI Ethics & Governance" },
    { label: "Quantitative Research", value: "Quantitative Research" },
  ],
  "Finance & Investment": [
    { label: "Stock Market & Trading", value: "Stock Market & Trading" },
    { label: "Mutual Funds & SIP", value: "Mutual Funds & SIP" },
    { label: "Personal Finance Planning", value: "Personal Finance Planning" },
    { label: "Cryptocurrency & Web3", value: "Cryptocurrency & Web3" },
    { label: "Tax Planning & Filing", value: "Tax Planning & Filing" },
    { label: "Investment Banking", value: "Investment Banking" },
    { label: "Real Estate Investment", value: "Real Estate Investment" },
    { label: "Insurance Planning", value: "Insurance Planning" },
    { label: "Retirement Planning", value: "Retirement Planning" },
    { label: "Corporate Finance", value: "Corporate Finance" },
    { label: "Forex & Commodities", value: "Forex & Commodities" },
    { label: "Financial Modeling", value: "Financial Modeling" },
  ],
  "Marketing & Branding": [
    { label: "Digital Marketing", value: "Digital Marketing" },
    { label: "Social Media Marketing", value: "Social Media Marketing" },
    { label: "SEO & SEM", value: "SEO & SEM" },
    { label: "Content Marketing", value: "Content Marketing" },
    { label: "Brand Strategy", value: "Brand Strategy" },
    { label: "Email Marketing", value: "Email Marketing" },
    { label: "Influencer Marketing", value: "Influencer Marketing" },
    { label: "Performance Marketing", value: "Performance Marketing" },
    { label: "Video & YouTube Marketing", value: "Video & YouTube Marketing" },
    { label: "E-commerce Marketing", value: "E-commerce Marketing" },
    { label: "Public Relations", value: "Public Relations" },
    {
      label: "Market Research & Analytics",
      value: "Market Research & Analytics",
    },
  ],
  "Health & Wellness": [
    { label: "Nutrition & Dietetics", value: "Nutrition & Dietetics" },
    {
      label: "Mental Health & Counseling",
      value: "Mental Health & Counseling",
    },
    {
      label: "Fitness & Personal Training",
      value: "Fitness & Personal Training",
    },
    { label: "Yoga & Meditation", value: "Yoga & Meditation" },
    { label: "Ayurveda", value: "Ayurveda" },
    { label: "Physiotherapy", value: "Physiotherapy" },
    { label: "Women's Health", value: "Women's Health" },
    { label: "Child & Pediatric Health", value: "Child & Pediatric Health" },
    {
      label: "Chronic Disease Management",
      value: "Chronic Disease Management",
    },
    { label: "Sports Medicine", value: "Sports Medicine" },
    { label: "Homeopathy", value: "Homeopathy" },
    { label: "Naturopathy", value: "Naturopathy" },
  ],
  "Legal Advisory": [
    { label: "Corporate & Company Law", value: "Corporate & Company Law" },
    { label: "Family & Matrimonial Law", value: "Family & Matrimonial Law" },
    { label: "Criminal Law", value: "Criminal Law" },
    { label: "Intellectual Property Law", value: "Intellectual Property Law" },
    { label: "Startup & Business Legal", value: "Startup & Business Legal" },
    {
      label: "Property & Real Estate Law",
      value: "Property & Real Estate Law",
    },
    { label: "Cyber Law", value: "Cyber Law" },
    { label: "Labour & Employment Law", value: "Labour & Employment Law" },
    { label: "Tax & GST Law", value: "Tax & GST Law" },
    { label: "Constitutional Law", value: "Constitutional Law" },
    { label: "Consumer Rights", value: "Consumer Rights" },
  ],
  "Business Strategy": [
    { label: "Startup Consulting", value: "Startup Consulting" },
    { label: "Operations Management", value: "Operations Management" },
    {
      label: "Product Strategy & Roadmap",
      value: "Product Strategy & Roadmap",
    },
    { label: "Growth Hacking", value: "Growth Hacking" },
    { label: "Business Development", value: "Business Development" },
    { label: "Franchising & Licensing", value: "Franchising & Licensing" },
    { label: "Supply Chain Management", value: "Supply Chain Management" },
    { label: "Project Management", value: "Project Management" },
    {
      label: "Fundraising & Investor Pitch",
      value: "Fundraising & Investor Pitch",
    },
    { label: "International Business", value: "International Business" },
    { label: "E-commerce Strategy", value: "E-commerce Strategy" },
  ],
  "Education & Tutoring": [
    { label: "Mathematics", value: "Mathematics" },
    {
      label: "Science (Physics/Chemistry/Biology)",
      value: "Science (Physics/Chemistry/Biology)",
    },
    {
      label: "English Language & Grammar",
      value: "English Language & Grammar",
    },
    {
      label: "Competitive Exams (JEE/NEET/UPSC)",
      value: "Competitive Exams (JEE/NEET/UPSC)",
    },
    {
      label: "Coding for Kids & Beginners",
      value: "Coding for Kids & Beginners",
    },
    { label: "History & Social Studies", value: "History & Social Studies" },
    { label: "Commerce & Accountancy", value: "Commerce & Accountancy" },
    { label: "Foreign Language Teaching", value: "Foreign Language Teaching" },
    { label: "Special Education", value: "Special Education" },
    { label: "Music & Arts Education", value: "Music & Arts Education" },
    { label: "Sports Coaching", value: "Sports Coaching" },
  ],
  "Human Resources": [
    {
      label: "Talent Acquisition & Recruitment",
      value: "Talent Acquisition & Recruitment",
    },
    {
      label: "HR Operations & Compliance",
      value: "HR Operations & Compliance",
    },
    {
      label: "Learning & Development (L&D)",
      value: "Learning & Development (L&D)",
    },
    { label: "Performance Management", value: "Performance Management" },
    {
      label: "Employee Relations & Engagement",
      value: "Employee Relations & Engagement",
    },
    { label: "Payroll & Compensation", value: "Payroll & Compensation" },
    { label: "Diversity & Inclusion", value: "Diversity & Inclusion" },
    { label: "HR Analytics", value: "HR Analytics" },
    {
      label: "Organizational Development",
      value: "Organizational Development",
    },
    { label: "Leadership Coaching", value: "Leadership Coaching" },
  ],
  "Civil Services & Government": [
    {
      label: "UPSC Civil Services (IAS/IPS/IFS)",
      value: "UPSC Civil Services (IAS/IPS/IFS)",
    },
    { label: "State PSC Exams", value: "State PSC Exams" },
    { label: "Banking & Insurance Exams", value: "Banking & Insurance Exams" },
    { label: "SSC & Railway Exams", value: "SSC & Railway Exams" },
    {
      label: "Defence Services (NDA/CDS/CAPF)",
      value: "Defence Services (NDA/CDS/CAPF)",
    },
    {
      label: "Government Policy & Governance",
      value: "Government Policy & Governance",
    },
    { label: "Public Administration", value: "Public Administration" },
  ],
  "Architecture & Design": [
    { label: "Residential Architecture", value: "Residential Architecture" },
    { label: "Interior Design", value: "Interior Design" },
    { label: "Urban & Landscape Design", value: "Urban & Landscape Design" },
    { label: "UI/UX Design", value: "UI/UX Design" },
    { label: "Graphic Design", value: "Graphic Design" },
    {
      label: "Product & Industrial Design",
      value: "Product & Industrial Design",
    },
    { label: "Fashion Design", value: "Fashion Design" },
    { label: "3D Modeling & Rendering", value: "3D Modeling & Rendering" },
  ],
  "Media & Journalism": [
    {
      label: "Print & Digital Journalism",
      value: "Print & Digital Journalism",
    },
    { label: "Broadcast & TV Journalism", value: "Broadcast & TV Journalism" },
    { label: "Photography & Videography", value: "Photography & Videography" },
    { label: "Film Making & Direction", value: "Film Making & Direction" },
    {
      label: "Podcast & Audio Production",
      value: "Podcast & Audio Production",
    },
    {
      label: "Content Writing & Copywriting",
      value: "Content Writing & Copywriting",
    },
    {
      label: "Social Media Content Creation",
      value: "Social Media Content Creation",
    },
  ],
  "Agriculture & Farming": [
    { label: "Organic Farming", value: "Organic Farming" },
    {
      label: "Hydroponics & Vertical Farming",
      value: "Hydroponics & Vertical Farming",
    },
    { label: "Agri Business & Marketing", value: "Agri Business & Marketing" },
    { label: "Animal Husbandry & Dairy", value: "Animal Husbandry & Dairy" },
    {
      label: "Horticulture & Floriculture",
      value: "Horticulture & Floriculture",
    },
    { label: "Government Agri Schemes", value: "Government Agri Schemes" },
    { label: "Farm Management", value: "Farm Management" },
  ],
  "Hospitality & Tourism": [
    { label: "Hotel & Resort Management", value: "Hotel & Resort Management" },
    { label: "Travel & Tourism Planning", value: "Travel & Tourism Planning" },
    {
      label: "Food & Beverage Management",
      value: "Food & Beverage Management",
    },
    {
      label: "Event Planning & Management",
      value: "Event Planning & Management",
    },
    { label: "Culinary Arts & Cooking", value: "Culinary Arts & Cooking" },
    {
      label: "Airlines & Airport Operations",
      value: "Airlines & Airport Operations",
    },
  ],
};

const QUALIFICATION_OPTIONS = [
  { label: "Graduate", value: "Graduate" },
  { label: "Post Graduate", value: "PG" },
  { label: "Diploma", value: "Diploma" },
  { label: "PHD Holder", value: "PHD Holder" },
  { label: "Other", value: "Other" },
];

const EXPERIENCE_OPTIONS = [
  { label: "Fresher", value: "0" },
  { label: "1 Year", value: "1" },
  { label: "2 Years", value: "2" },
  { label: "3 Years", value: "3" },
  { label: "5 Years", value: "5" },
  { label: "8+ Years", value: "8" },
];

const LOCATION_OPTIONS = [
  { label: "Mumbai", value: "Mumbai" },
  { label: "Pune", value: "Pune" },
  { label: "Nashik", value: "Nashik" },
  { label: "Nagpur", value: "Nagpur" },
  { label: "Chhatrapati Sambhajinagar", value: "Chhatrapati Sambhajinagar" },
  { label: "Other", value: "Other" },
];

// ── Dropdown ──────────────────────────────────────────────────────────────
function DropdownPicker({ label, value, options, onChange }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: selected ? TEXT_1 : TEXT_2,
            fontSize: 15,
            fontWeight: selected ? "500" : "400",
          }}
        >
          {selected ? selected.label : `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={18} color={TEXT_2} />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={modalStyles.overlay}
          onPress={() => setVisible(false)}
        />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  modalStyles.item,
                  item.value === value && modalStyles.itemSelected,
                ]}
                onPress={() => {
                  onChange(item.value);
                  setVisible(false);
                }}
              >
                <Text
                  style={[
                    modalStyles.itemText,
                    item.value === value && modalStyles.itemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {item.value === value && (
                  <Ionicons name="checkmark-circle" size={20} color={TEAL} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

// ── Skills picker ─────────────────────────────────────────────────────────
function SkillsPicker({ selectedSkills, onChange, domain, subDomain }) {
  const [visible, setVisible] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const skillList =
    subDomain && SUBDOMAIN_SKILLS_MAP[subDomain]
      ? SUBDOMAIN_SKILLS_MAP[subDomain]
      : domain && DOMAIN_SKILLS_MAP[domain]
        ? DOMAIN_SKILLS_MAP[domain]
        : SKILL_OPTIONS;

  const suggestedLabel =
    subDomain && SUBDOMAIN_SKILLS_MAP[subDomain]
      ? `Skills for: ${subDomain}`
      : domain && DOMAIN_SKILLS_MAP[domain]
        ? `Skills for: ${domain}`
        : null;

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
      return;
    }
    if (selectedSkills.length >= 5) {
      Alert.alert("Max 5 skills", "You can select up to 5 skills");
      return;
    }
    onChange([...selectedSkills, skill]);
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    if (selectedSkills.includes(trimmed)) {
      Alert.alert("Already added");
      return;
    }
    if (selectedSkills.length >= 5) {
      Alert.alert("Max 5 skills");
      return;
    }
    onChange([...selectedSkills, trimmed]);
    setCustomSkill("");
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          {selectedSkills.length === 0 ? (
            <Text style={{ color: TEXT_2, fontSize: 15, fontWeight: "400" }}>
              Select Skills (max 5)
            </Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {selectedSkills.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={styles.chip}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={styles.chipText}>{skill}</Text>
                  <Ionicons
                    name="close"
                    size={12}
                    color="#fff"
                    style={{ marginLeft: 3 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <Ionicons name="chevron-down" size={18} color={TEXT_2} />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={modalStyles.overlay}
          onPress={() => setVisible(false)}
        />
        <View style={[modalStyles.sheet, { maxHeight: "70%" }]}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Select Skills (max 5)</Text>
          {suggestedLabel && (
            <Text
              style={{
                color: TEAL,
                textAlign: "center",
                marginBottom: 2,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              💡 {suggestedLabel}
            </Text>
          )}
          <Text style={modalStyles.subtitle}>
            {selectedSkills.length}/5 selected
          </Text>
          <View style={modalStyles.customRow}>
            <TextInput
              style={modalStyles.customInput}
              placeholder="Add custom skill..."
              placeholderTextColor={TEXT_2}
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity
              style={modalStyles.customAddBtn}
              onPress={addCustomSkill}
            >
              <Text style={modalStyles.customAddText}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={skillList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedSkills.includes(item);
              return (
                <TouchableOpacity
                  style={[
                    modalStyles.item,
                    isSelected && modalStyles.itemSelected,
                  ]}
                  onPress={() => toggleSkill(item)}
                >
                  <Text
                    style={[
                      modalStyles.itemText,
                      isSelected && modalStyles.itemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={TEAL} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={modalStyles.doneBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={modalStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ── Languages picker ──────────────────────────────────────────────────────
function LanguagesPicker({ selectedLanguages, onChange }) {
  const [visible, setVisible] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      onChange(selectedLanguages.filter((l) => l !== lang));
      return;
    }
    if (selectedLanguages.length >= 5) {
      Alert.alert("Max 5 languages");
      return;
    }
    onChange([...selectedLanguages, lang]);
  };

  const addCustomLanguage = () => {
    const trimmed = customLang.trim();
    if (!trimmed) return;
    if (selectedLanguages.includes(trimmed)) {
      Alert.alert("Already added");
      return;
    }
    if (selectedLanguages.length >= 5) {
      Alert.alert("Max 5 languages");
      return;
    }
    onChange([...selectedLanguages, trimmed]);
    setCustomLang("");
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          {selectedLanguages.length === 0 ? (
            <Text style={{ color: TEXT_2, fontSize: 15, fontWeight: "400" }}>
              Select Languages (max 5)
            </Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {selectedLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={styles.chip}
                  onPress={() => toggleLanguage(lang)}
                >
                  <Text style={styles.chipText}>{lang}</Text>
                  <Ionicons
                    name="close"
                    size={12}
                    color="#fff"
                    style={{ marginLeft: 3 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <Ionicons name="chevron-down" size={18} color={TEXT_2} />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={modalStyles.overlay}
          onPress={() => setVisible(false)}
        />
        <View style={[modalStyles.sheet, { maxHeight: "70%" }]}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Select Languages (max 5)</Text>
          <Text style={modalStyles.subtitle}>
            {selectedLanguages.length}/5 selected
          </Text>
          <View style={modalStyles.customRow}>
            <TextInput
              style={modalStyles.customInput}
              placeholder="Add custom language..."
              placeholderTextColor={TEXT_2}
              value={customLang}
              onChangeText={setCustomLang}
            />
            <TouchableOpacity
              style={modalStyles.customAddBtn}
              onPress={addCustomLanguage}
            >
              <Text style={modalStyles.customAddText}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGE_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedLanguages.includes(item);
              return (
                <TouchableOpacity
                  style={[
                    modalStyles.item,
                    isSelected && modalStyles.itemSelected,
                  ]}
                  onPress={() => toggleLanguage(item)}
                >
                  <Text
                    style={[
                      modalStyles.itemText,
                      isSelected && modalStyles.itemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={TEAL} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={modalStyles.doneBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={modalStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const FieldLabel = ({ text }) => <Text style={styles.fieldLabel}>{text}</Text>;

function InputField({
  label,
  value,
  field,
  setForm,
  form,
  keyboardType,
  placeholder,
  editable = true,
}) {
  return (
    <View style={styles.fieldGroup}>
      <FieldLabel text={label} />
      <TextInput
        value={value}
        onChangeText={(text) => setForm({ ...form, [field]: text })}
        style={[styles.input, !editable && styles.inputDisabled]}
        keyboardType={keyboardType || "default"}
        placeholder={placeholder || ""}
        placeholderTextColor={TEXT_2}
        editable={editable}
      />
    </View>
  );
}

const SectionHeader = ({ icon, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconWrap}>
      <Ionicons name={icon} size={16} color="#fff" />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ── Status Modal (success + error) ───────────────────────────────────────
// NOTE: confetti uses fixed pixel coords — RN does NOT support "%" for top/left on absolute elements
function StatusModal({ visible, type, message, onClose }) {
  const isSuccess = type === "success";

  // Confetti dots — only shown on success
  const dots = [
    [28, 26, "#f472b6", 9],
    [75, 14, "#fbbf24", 8],
    [138, 8, "#a78bfa", 7],
    [188, 20, "#34d399", 8],
    [242, 10, "#60a5fa", 7],
    [282, 28, "#34d399", 9],
    [52, 50, "#60a5fa", 7],
    [105, 40, "#fbbf24", 6],
    [158, 46, "#f472b6", 7],
    [212, 38, "#a78bfa", 8],
    [262, 52, "#fbbf24", 6],
    [308, 18, "#f472b6", 7],
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={sm.overlay}>
        <View style={[sm.card, !isSuccess && { paddingTop: 36 }]}>
          {/* ── Confetti — only on success ── */}
          {isSuccess && (
            <View style={sm.confettiWrap} pointerEvents="none">
              {dots.map(([left, top, color, size], i) => (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                  }}
                />
              ))}
            </View>
          )}

          {/* ── Badge ── */}
          <View style={[sm.ring, !isSuccess && { backgroundColor: "#fde8e8" }]}>
            <View
              style={[sm.circle, !isSuccess && { backgroundColor: "#DC2626" }]}
            >
              <Ionicons
                name={isSuccess ? "checkmark" : "close"}
                size={40}
                color={WHITE}
              />
            </View>
          </View>

          {/* ── Text ── */}
          <Text style={sm.title}>
            {isSuccess ? "Profile Saved " : "Update Failed!"}
          </Text>
          <Text style={sm.subtitle}>
            {isSuccess
              ? "You've successfully completed your\nprofessional details."
              : message || "Something went wrong. Please try again."}
          </Text>

          {/* ── Buttons ── */}
          {isSuccess ? (
            <View style={sm.btnRow}>
              <TouchableOpacity
                style={sm.keepBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={sm.keepTxt}>Keep Editing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={sm.proceedBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={sm.proceedTxt}>OK </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={sm.retryBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={sm.retryTxt}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
const EditProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExpert, setIsExpert] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  // ── Status modal state (success + error) ──
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    domain: "",
    sub_domain: "",
    qualification: "",
    experience: "",
    dob: "",
    skills: "",
    preferred_job_role: "",
    current_status: "",
    expertise: "",
    years_of_experience: "",
    linkedin: "",
    bio: "",
    location: "",
    certification: "",
    image_file: null,
    image_url: "",
    cv_file: null,
    existing_cv: "",
  });

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleDomainChange = (value) => {
    setForm((prev) => ({ ...prev, domain: value, sub_domain: "" }));
    setSelectedSkills([]);
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.user;
      const expertRole = user?.role === "expert";
      setIsExpert(expertRole);
      setForm((prev) => ({
        ...prev,
        full_name: user.full_name || user.fullName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        domain: user.domain || "",
        sub_domain: user.sub_domain || "",
        qualification: user.qualification || "",
        experience: user.experience != null ? String(user.experience) : "",
        dob: user.dob || "",
        skills: user.skills || "",
        preferred_job_role: user.preferred_job_role || "",
        current_status: user.current_status || "",
        expertise: user.expertise || "",
        years_of_experience: user.years_of_experience || "",
        linkedin: user.linkedin || "",
        image_file: null,
        image_url: user.image ? getImageUri(user.image) : "",
        existing_cv: user.cvFile || user.cv || "",
      }));

      if (!expertRole && user.skills) {
        const skillArr = user.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (skillArr.length > 0) setSelectedSkills(skillArr);
      }

      if (expertRole) {
        try {
          const expertRes = await axios.get(
            `${BASE_URL}/api/experts/profile/me`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const ep = expertRes.data.data;
          if (ep) {
            setForm((prev) => ({
              ...prev,
              full_name: ep.name || prev.full_name,
              domain: ep.domain || prev.domain,
              sub_domain: ep.sub_domain || prev.sub_domain,
              experience:
                ep.experience != null ? String(ep.experience) : prev.experience,
              bio: ep.bio || "",
              location: ep.location || "",
              certification: ep.certification || "",
              expertise: ep.domain || prev.expertise,
              years_of_experience:
                ep.years_of_experience != null
                  ? String(ep.years_of_experience)
                  : prev.years_of_experience,
              image_url: ep.image ? getImageUri(ep.image) : prev.image_url,
              existing_cv: ep.cv || prev.existing_cv,
            }));
            if (ep.skills && ep.skills.length > 0)
              setSelectedSkills(ep.skills.map((s) => s.skill_name));
            if (ep.language_spoken)
              setSelectedLanguages(
                ep.language_spoken
                  .split(",")
                  .map((l) => l.trim())
                  .filter(Boolean),
              );
          }
        } catch (err) {
          console.log("Expert profile fetch error:", err.message);
        }
      }
    } catch (err) {
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required to access gallery");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled)
      setForm((prev) => ({
        ...prev,
        image_file: result.assets[0].uri,
        image_url: result.assets[0].uri,
      }));
  };

  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) updateForm("cv_file", result.assets[0]);
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("fullName", form.full_name);
      formData.append("email", form.email);
      formData.append("mobile", form.mobile);
      formData.append("domain", form.domain);
      formData.append("sub_domain", form.sub_domain || "");
      formData.append("qualification", form.qualification);
      formData.append("experience", form.experience);
      formData.append("dob", form.dob);
      formData.append("preferred_job_role", form.preferred_job_role);
      formData.append("current_status", form.current_status);
      formData.append("expertise", form.expertise);
      formData.append("years_of_experience", form.years_of_experience);
      formData.append("linkedin", form.linkedin);
      if (isExpert) {
        formData.append("bio", form.bio);
        formData.append("location", form.location);
        formData.append("certification", form.certification);
        formData.append(
          "language_spoken",
          selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "",
        );
        if (selectedSkills.length > 0)
          formData.append("skills", selectedSkills.join(", "));
      } else {
        formData.append(
          "skills",
          selectedSkills.length > 0 ? selectedSkills.join(", ") : "",
        );
      }
      if (form.image_file)
        formData.append("image", {
          uri: form.image_file,
          name: "profile.jpg",
          type: "image/jpeg",
        });
      if (form.cv_file) {
        const cleanUri = form.cv_file.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();
        formData.append("cv", {
          uri: cleanUri,
          name: form.cv_file.name || `cv.${ext}`,
          type: ext === "pdf" ? "application/pdf" : `image/${ext}`,
        });
      }
      await axios.post(`${BASE_URL}/api/users/save-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (isExpert) {
        const expertFormData = new FormData();
        expertFormData.append("fullName", form.full_name);
        expertFormData.append("domain", form.domain);
        expertFormData.append("sub_domain", form.sub_domain || "");
        expertFormData.append("bio", form.bio);
        expertFormData.append("location", form.location);
        expertFormData.append("certification", form.certification);
        expertFormData.append("certifications", form.certification);
        expertFormData.append("expertise", form.expertise);
        expertFormData.append(
          "experience",
          form.years_of_experience || form.experience,
        );
        expertFormData.append(
          "language_spoken",
          selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "",
        );
        expertFormData.append(
          "skills",
          selectedSkills.length > 0 ? selectedSkills.join(", ") : "",
        );
        if (form.image_file)
          expertFormData.append("image", {
            uri: form.image_file,
            name: "profile.jpg",
            type: "image/jpeg",
          });
        await axios.put(`${BASE_URL}/api/experts/profile/me`, expertFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      // ── Show success modal ──
      setStatusModal({ visible: true, type: "success", message: "" });
    } catch (err) {
      console.log("❌ Save error:", err.response?.data || err.message);
      setStatusModal({
        visible: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Profile update failed. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const subDomainOptions = SUBDOMAIN_MAP[form.domain] || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* ── Profile Image ── */}
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image
            source={{
              uri: form.image_url || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
          <Text style={styles.changePhoto}>Change Photo</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InputField
          label="Full Name"
          value={form.full_name}
          field="full_name"
          setForm={setForm}
          form={form}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { color: "#999" }]}
          value={form.email}
          editable={false}
        />
        <InputField
          label="Mobile"
          value={form.mobile}
          field="mobile"
          setForm={setForm}
          form={form}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Domain</Text>
        <DropdownPicker
          label="Domain"
          value={form.domain}
          options={DOMAIN_OPTIONS}
          onChange={handleDomainChange}
        />

        {subDomainOptions.length > 0 && (
          <>
            <Text style={styles.label}>Sub-Domain</Text>
            <DropdownPicker
              label="Sub-Domain"
              value={form.sub_domain}
              options={subDomainOptions}
              onChange={(v) => updateForm("sub_domain", v)}
            />
          </>
        )}

        <Text style={styles.label}>Qualification</Text>
        <DropdownPicker
          label="Qualification"
          value={form.qualification}
          options={QUALIFICATION_OPTIONS}
          onChange={(v) => updateForm("qualification", v)}
        />

        <Text style={styles.label}>Experience</Text>
        <DropdownPicker
          label="Experience"
          value={form.experience}
          options={EXPERIENCE_OPTIONS}
          onChange={(v) => updateForm("experience", v)}
        />

        <InputField
          label="Date of Birth (YYYY-MM-DD)"
          value={form.dob}
          field="dob"
          setForm={setForm}
          form={form}
          placeholder="e.g. 1995-06-15"
        />

        <Text style={styles.label}>CV / Resume</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickCV}>
          <Ionicons name="document-attach-outline" size={20} color={TEAL} />
          <Text style={styles.uploadBtnText}>
            {form.cv_file
              ? form.cv_file.name
              : form.existing_cv
                ? "📄 CV Uploaded ✓"
                : "Choose CV File"}
          </Text>
          {(form.cv_file || form.existing_cv) && (
            <Ionicons name="pencil-outline" size={16} color={TEAL} />
          )}
        </TouchableOpacity>

        {!isExpert && (
          <>
            <Text style={styles.sectionTitle}>Jobseeker Details</Text>
            <Text style={styles.label}>Skills (max 5)</Text>
            <SkillsPicker
              selectedSkills={selectedSkills}
              onChange={setSelectedSkills}
              domain={form.domain}
              subDomain={form.sub_domain}
            />
            <Text style={styles.label}>Preferred Job Role</Text>
            <DropdownPicker
              label="Preferred Job Role"
              value={form.preferred_job_role}
              options={PREFERRED_JOB_OPTIONS}
              onChange={(v) => updateForm("preferred_job_role", v)}
            />
            <Text style={styles.label}>Current Status</Text>
            <DropdownPicker
              label="Current Status"
              value={form.current_status}
              options={CURRENT_STATUS_OPTIONS}
              onChange={(v) => updateForm("current_status", v)}
            />
          </>
        )}

        {isExpert && (
          <>
            <Text style={styles.sectionTitle}>Expert Details</Text>
            <Text style={styles.label}>Skills (max 5)</Text>
            <SkillsPicker
              selectedSkills={selectedSkills}
              onChange={setSelectedSkills}
              domain={form.domain}
              subDomain={form.sub_domain}
            />
            <Text style={styles.label}>Languages Known</Text>
            <LanguagesPicker
              selectedLanguages={selectedLanguages}
              onChange={setSelectedLanguages}
            />
            <Text style={styles.label}>Location / City</Text>
            <DropdownPicker
              label="Location"
              value={form.location}
              options={LOCATION_OPTIONS}
              onChange={(v) => updateForm("location", v)}
            />
            <InputField
              label="Certification"
              value={form.certification}
              field="certification"
              setForm={setForm}
              form={form}
              placeholder="e.g. AWS, PMP, MBA"
            />
            <Text style={styles.label}>Bio</Text>
            <TextInput
              value={form.bio}
              onChangeText={(text) => updateForm("bio", text)}
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
              placeholder="Write a short bio about yourself"
              placeholderTextColor={TEXT_2}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveProfile}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ── STATUS MODAL (success + error) ── */}
      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        message={statusModal.message}
        onClose={() => {
          if (statusModal.type === "success") {
            setStatusModal({ visible: false, type: "success", message: "" });
            router.back();
          } else {
            setStatusModal({ visible: false, type: "error", message: "" });
          }
        }}
      />
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 50, backgroundColor: PAGE_BG },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PAGE_BG,
    gap: 12,
  },
  loadingText: { color: TEAL, fontSize: 14, fontWeight: "600" },
  imageContainer: { alignItems: "center", marginBottom: 20, paddingTop: 8 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: TEAL,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 24,
    right: "35%",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhoto: { color: TEAL, fontSize: 13, fontWeight: "600", marginTop: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: -0.1,
    marginTop: 16,
    marginBottom: 8,
  },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_2,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_1,
    fontWeight: "500",
  },
  inputDisabled: { backgroundColor: "#f0f0f0", color: TEXT_2 },
  dropdownBox: {
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL_LIGHT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  uploadBtnText: { flex: 1, fontSize: 14, color: TEAL, fontWeight: "600" },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    minHeight: 48,
  },
  chipsEmpty: { color: TEXT_2, fontSize: 13 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  addChipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 12,
    borderStyle: "dashed",
    justifyContent: "center",
    backgroundColor: TEAL_LIGHT,
  },
  addChipText: { color: TEAL, fontWeight: "700", fontSize: 13 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    elevation: 3,
    shadowColor: TEAL,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

// ── Modal styles ───────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    maxHeight: "55%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_1,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: TEXT_2,
    textAlign: "center",
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "500",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  itemSelected: { backgroundColor: TEAL_LIGHT, borderRadius: 10 },
  itemText: { fontSize: 15, color: TEXT_1, fontWeight: "400" },
  itemTextSelected: { color: TEAL, fontWeight: "700" },
  customRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  customInput: {
    flex: 1,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: TEXT_1,
  },
  customAddBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  customAddText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  doneBtn: {
    backgroundColor: TEAL,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

