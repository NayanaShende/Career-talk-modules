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

const BASE_URL = "http://192.168.1.17:3000";

const getImageUri = (image) => {
  if (image) {
    if (image.startsWith("http://") || image.startsWith("https://"))
      return image;
    const cleanImage = image.replace(/^uploads\//, "");
    return `${BASE_URL}/uploads/${cleanImage}`;
  }
  return "https://via.placeholder.com/150";
};

// ✅ UPDATED: Domain-specific skills
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
  "SEO",
  "Digital Marketing",
  "Content Writing",
  "Graphic Design",
  "Stock Market",
  "Tax Planning",
  "Yoga",
  "Counseling",
  "Legal Research",
  "Business Strategy",
  "HR Recruitment",
  "Photography",
  "Video Editing",
  "Other",
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
  "Sanskrit",
  "Odia",
  "Assamese",
  "Konkani",
  "Other",
];

// ✅ UPDATED: 15 domains (was 10)
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

// ✅ UPDATED: Rich sub-domain map with 7–12 options per domain
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
  { label: "Marathi Medium", value: "Marathi Medium" },
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

function DropdownPicker({ label, value, options, onChange }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: selected ? "#000" : "#777", fontSize: 15 }}>
          {selected ? selected.label : `Select ${label}`}
        </Text>
        <Text style={{ color: "#777" }}>▼</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  item.value === value && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onChange(item.value);
                  setVisible(false);
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: item.value === value ? "700" : "400",
                    color: item.value === value ? "#0B2D72" : "#333",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

// ✅ UPDATED: SkillsPicker now accepts domain prop
function SkillsPicker({ selectedSkills, onChange, domain }) {
  const [visible, setVisible] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const skillList =
    domain && DOMAIN_SKILLS_MAP[domain]
      ? DOMAIN_SKILLS_MAP[domain]
      : SKILL_OPTIONS;

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
      <View style={styles.selectedChipsContainer}>
        {selectedSkills.length === 0 ? (
          <Text style={{ color: "#777", fontSize: 13 }}>
            No skills selected
          </Text>
        ) : (
          selectedSkills.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={styles.chip}
              onPress={() => toggleSkill(skill)}
            >
              <Text style={styles.chipText}>{skill}</Text>
              <Ionicons
                name="close"
                size={14}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
      <TouchableOpacity
        style={styles.addChipBtn}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={18} color="#0B2D72" />
        <Text style={styles.addChipBtnText}>
          {selectedSkills.length === 0 ? "Add Skills" : "Edit Skills"} (max 5)
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={[styles.modalBox, { maxHeight: "70%" }]}>
          <Text style={styles.modalTitle}>Select Skills (max 5)</Text>
          {domain && DOMAIN_SKILLS_MAP[domain] && (
            <Text
              style={{
                color: "#0B2D72",
                textAlign: "center",
                marginBottom: 4,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Skills for: {domain}
            </Text>
          )}
          <Text
            style={{
              color: "#888",
              textAlign: "center",
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            {selectedSkills.length}/5 selected
          </Text>
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Add custom skill..."
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity
              style={styles.customAddBtn}
              onPress={addCustomSkill}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
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
                    styles.modalItem,
                    isSelected && styles.modalItemSelected,
                  ]}
                  onPress={() => toggleSkill(item)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected ? "#0B2D72" : "#333",
                        fontWeight: isSelected ? "700" : "400",
                      }}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#0B2D72"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={[styles.saveBtn, { marginTop: 10 }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.saveText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

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
      <View style={styles.selectedChipsContainer}>
        {selectedLanguages.length === 0 ? (
          <Text style={{ color: "#777", fontSize: 13 }}>
            No languages selected
          </Text>
        ) : (
          selectedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={styles.chip}
              onPress={() => toggleLanguage(lang)}
            >
              <Text style={styles.chipText}>{lang}</Text>
              <Ionicons
                name="close"
                size={14}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
      <TouchableOpacity
        style={styles.addChipBtn}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={18} color="#0B2D72" />
        <Text style={styles.addChipBtnText}>
          {selectedLanguages.length === 0 ? "Add Languages" : "Edit Languages"}{" "}
          (max 5)
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={[styles.modalBox, { maxHeight: "70%" }]}>
          <Text style={styles.modalTitle}>Select Languages (max 5)</Text>
          <Text
            style={{
              color: "#888",
              textAlign: "center",
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            {selectedLanguages.length}/5 selected
          </Text>
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Add custom language..."
              value={customLang}
              onChangeText={setCustomLang}
            />
            <TouchableOpacity
              style={styles.customAddBtn}
              onPress={addCustomLanguage}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
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
                    styles.modalItem,
                    isSelected && styles.modalItemSelected,
                  ]}
                  onPress={() => toggleLanguage(item)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected ? "#0B2D72" : "#333",
                        fontWeight: isSelected ? "700" : "400",
                      }}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#0B2D72"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={[styles.saveBtn, { marginTop: 10 }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.saveText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const EditProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExpert, setIsExpert] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

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

  // ✅ Reset sub_domain + skills when domain changes
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
            if (ep.language_spoken) {
              const langs = ep.language_spoken
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean);
              setSelectedLanguages(langs);
            }
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
        formData.append("skills", form.skills);
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
      console.log("📤 Step 1: Saving user profile...");
      await axios.post(`${BASE_URL}/api/users/save-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (isExpert) {
        console.log("📤 Step 2: Saving expert profile via PUT /profile/me...");
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
        console.log("✅ Expert profile updated successfully");
      }
      Alert.alert("✅ Success", "Profile Updated Successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.log("❌ Save error:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Profile update failed. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const subDomainOptions = SUBDOMAIN_MAP[form.domain] || [];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0B2D72" />
        <Text style={{ marginTop: 10, color: "#0B2D72" }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
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

        {/* ── Domain ── */}
        <Text style={styles.label}>Domain</Text>
        <DropdownPicker
          label="Domain"
          value={form.domain}
          options={DOMAIN_OPTIONS}
          onChange={handleDomainChange}
        />

        {/* ✅ Sub-Domain — only shows when domain is selected */}
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
          <Ionicons name="document-attach-outline" size={20} color="#0B2D72" />
          <Text style={styles.uploadBtnText}>
            {form.cv_file
              ? form.cv_file.name
              : form.existing_cv
                ? `Current: ${form.existing_cv}`
                : "Choose CV File"}
          </Text>
        </TouchableOpacity>

        {!isExpert && (
          <>
            <Text style={styles.sectionTitle}>Jobseeker Details</Text>
            <InputField
              label="Skills"
              value={form.skills}
              field="skills"
              setForm={setForm}
              form={form}
            />
            <InputField
              label="Preferred Job Role"
              value={form.preferred_job_role}
              field="preferred_job_role"
              setForm={setForm}
              form={form}
            />
            <InputField
              label="Current Status (Student / Fresher)"
              value={form.current_status}
              field="current_status"
              setForm={setForm}
              form={form}
            />
          </>
        )}

        {isExpert && (
          <>
            <Text style={styles.sectionTitle}>Expert Details</Text>
            <Text style={styles.label}>Skills (max 5)</Text>
            {/* ✅ Domain hint */}
            {form.domain && DOMAIN_SKILLS_MAP[form.domain] && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#0B2D72",
                  marginTop: 4,
                  marginBottom: 2,
                  fontWeight: "600",
                }}
              >
                💡 Showing skills for: {form.domain}
              </Text>
            )}
            {/* ✅ Pass domain to SkillsPicker */}
            <SkillsPicker
              selectedSkills={selectedSkills}
              onChange={setSelectedSkills}
              domain={form.domain}
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
            />
            <InputField
              label="Expertise"
              value={form.expertise}
              field="expertise"
              setForm={setForm}
              form={form}
            />
            <InputField
              label="Years of Experience"
              value={form.years_of_experience}
              field="years_of_experience"
              setForm={setForm}
              form={form}
              keyboardType="numeric"
            />
          </>
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

function InputField({
  label,
  value,
  field,
  setForm,
  form,
  keyboardType,
  placeholder,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => setForm({ ...form, [field]: text })}
        style={styles.input}
        keyboardType={keyboardType || "default"}
        placeholder={placeholder || ""}
      />
    </View>
  );
}

export default EditProfile;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  cameraIcon: {
    position: "absolute",
    bottom: 28,
    right: "33%",
    backgroundColor: "#0B2D72",
    borderRadius: 14,
    padding: 5,
  },
  changePhoto: { color: "#0B2D72", marginTop: 8, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 10,
    color: "#0B2D72",
  },
  inputGroup: { marginBottom: 15 },
  label: {
    marginBottom: 5,
    fontWeight: "500",
    color: "#374151",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
    marginTop: 5,
  },
  uploadBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fafafa",
    marginTop: 5,
  },
  uploadBtnText: { color: "#374151", fontWeight: "500", flex: 1 },
  selectedChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    minHeight: 40,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B2D72",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  addChipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#0B2D72",
    borderRadius: 8,
    borderStyle: "dashed",
    justifyContent: "center",
  },
  addChipBtnText: { color: "#0B2D72", fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "55%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B2D72",
    textAlign: "center",
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  modalItemSelected: { backgroundColor: "#f0f4ff", borderRadius: 8 },
  customRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  customInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
  customAddBtn: {
    backgroundColor: "#0B2D72",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#0B2D72",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
