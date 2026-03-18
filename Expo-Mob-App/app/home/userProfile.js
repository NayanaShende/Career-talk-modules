import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://192.168.1.16:3000";

// ✅ UPDATED: Domain-specific skills — shown when expert picks a domain
const DOMAIN_SKILLS_MAP = {
  "Career Counseling": ["Career Coaching","Resume Writing","LinkedIn Optimization","Mock Interviews","Group Discussion","Aptitude Training","Soft Skills","Communication Skills","Body Language","Goal Setting","Motivation & Mindset","Personality Assessment"],
  "Software Engineering": ["React","React Native","Next.js","Vue.js","Angular","Node.js","Express.js","Django","FastAPI","Spring Boot","Flutter","Android (Kotlin)","iOS (Swift)","AWS","Azure","GCP","Docker","Kubernetes","PostgreSQL","MongoDB","Redis","GraphQL","System Design","DSA","Git & GitHub","Cybersecurity","Blockchain","Unity (Game Dev)"],
  "Data Science & AI": ["Python","R","SQL","Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch","Keras","Power BI","Tableau","Excel (Advanced)","Spark","Hadoop","Feature Engineering","Model Deployment","MLflow","OpenAI API","LangChain","Prompt Engineering","Statistics & Probability","A/B Testing"],
  "Finance & Investment": ["Stock Analysis (Technical)","Stock Analysis (Fundamental)","Mutual Fund Planning","Portfolio Management","Tax Planning","GST Filing","Income Tax Returns","Financial Modeling (Excel)","Valuation","Crypto Trading","Forex Trading","Options & Futures","Insurance Planning","Tally","Zoho Books","CA / CFA / CFP Knowledge"],
  "Marketing & Branding": ["SEO","Google Ads","Meta Ads (Facebook/Instagram)","Content Writing","Copywriting","Email Marketing","Canva","Adobe Photoshop","Adobe Premiere Pro","Google Analytics","HubSpot","Mailchimp","YouTube Marketing","Influencer Outreach","Brand Strategy","Market Research","WhatsApp Marketing","Affiliate Marketing"],
  "Health & Wellness": ["Nutrition Planning","Diet Charting","Weight Management","Yoga","Pranayama","Meditation","Zumba","CrossFit","Ayurvedic Consultation","Physiotherapy Exercises","Mental Health Counseling","CBT Therapy","First Aid & CPR","Sports Nutrition","Homeopathy","Child Nutrition","Naturopathy"],
  "Legal Advisory": ["Contract Drafting","Legal Research","Case Filing","IP Registration","Trademark","Patent","GST & Tax Law","Labour Law","Consumer Law","Company Incorporation","MCA Filings","Cyber Law","Property Law","Family Law","Arbitration & Mediation","Legal Document Review"],
  "Business Strategy": ["Business Plan Writing","Market Research","Financial Projections","Pitch Deck Creation","SWOT & PESTLE Analysis","OKR Framework","Agile & Scrum","PMP Certification","Operations Optimization","Supply Chain","CRM Strategy","SAP / Oracle ERP","Product Roadmap","Go-to-Market Strategy","Fundraising Strategy","Startup Mentoring"],
  "Education & Tutoring": ["Mathematics (Class 8-12)","Physics","Chemistry","Biology","English Grammar","Essay Writing","JEE Preparation","NEET Preparation","UPSC Preparation","Vedic Maths","Abacus","Scratch (Kids Coding)","Python for Beginners","Accountancy","Economics","Marathi Literature","Hindi Literature","Music (Vocal/Instrumental)","Drawing & Painting","Cricket Coaching","Football Coaching"],
  "Human Resources": ["Recruitment & Sourcing","LinkedIn Hiring","ATS Tools (Naukri/LinkedIn)","HR Policies & Compliance","Payroll Management","HRMS Tools (Keka/Darwinbox/SAP)","Performance Appraisal","Employee Engagement","Training & Development","Labor Law","Diversity & Inclusion","HR Analytics","Leadership Training","Conflict Resolution"],
  "Civil Services & Government": ["General Studies (GS Paper 1-4)","CSAT","Essay Writing","Current Affairs","Indian Polity & Constitution","Indian Economy","History & Culture","Geography","Banking Awareness","Quantitative Aptitude","Reasoning Ability","English (Descriptive)","Marathi (Descriptive)","UPSC Interview Preparation"],
  "Architecture & Design": ["AutoCAD","Revit","SketchUp","Rhino 3D","Adobe Photoshop","Adobe Illustrator","Adobe InDesign","Figma","Adobe XD","3ds Max","Blender","V-Ray Rendering","Interior Space Planning","Landscape Design","UI/UX Research","Wireframing & Prototyping","Fashion Illustration","Textile Design"],
  "Media & Journalism": ["News Writing","Feature Writing","Investigative Journalism","Video Editing (Premiere Pro)","Video Editing (DaVinci)","Photography (DSLR)","YouTube Content Creation","Podcast Production","Script Writing","Adobe Audition","Final Cut Pro","Social Media Management","Fact Checking","Interviewing Techniques"],
  "Agriculture & Farming": ["Organic Farming Techniques","Soil Testing","Drip Irrigation","Hydroponics Setup","Crop Disease Management","Pesticide Management","Government Agri Schemes","Agri Export & Marketing","Dairy Management","Poultry Farming","Horticulture","Farm Accounting","Agri Drone Technology"],
  "Hospitality & Tourism": ["Front Office Operations","Housekeeping Management","Food & Beverage Service","Culinary Skills","Event Planning","Tour Package Design","Travel Agency Operations","Hotel Revenue Management","Customer Service","GDS - Amadeus/Galileo","Restaurant Management","Bartending & Mixology"],
};

// ✅ Fallback skills for jobseeker / no domain selected
const SKILL_OPTIONS = [
  "React","React Native","Node.js","Python","Java",
  "Angular","Vue.js","DevOps","UI/UX Design","Data Analysis",
  "Machine Learning","PHP","Laravel","Django","Flutter",
  "Marathi Teacher","English Teacher","Mathematics","Science",
  "SEO","Digital Marketing","Content Writing","Graphic Design",
  "Stock Market","Tax Planning","Yoga","Counseling",
  "Legal Research","Business Strategy","HR Recruitment",
  "Photography","Video Editing","Other",
];

const LANGUAGE_OPTIONS = [
  "English","Hindi","Marathi","Gujarati","Bengali",
  "Tamil","Telugu","Kannada","Punjabi","Urdu",
  "Sanskrit","Odia","Assamese","Konkani","Other",
];

// ✅ UPDATED: 16 domains (was 11)
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
  { label: "Civil Services & Government", value: "Civil Services & Government" },
  { label: "Architecture & Design", value: "Architecture & Design" },
  { label: "Media & Journalism", value: "Media & Journalism" },
  { label: "Agriculture & Farming", value: "Agriculture & Farming" },
  { label: "Hospitality & Tourism", value: "Hospitality & Tourism" },
  { label: "Other", value: "Other" },
];

// ✅ UPDATED: Rich sub-domain map with 7–12 options per domain
const SUBDOMAIN_MAP = {
  "Career Counseling": [
    { label: "Resume & LinkedIn Building", value: "Resume & LinkedIn Building" },
    { label: "Interview Preparation", value: "Interview Preparation" },
    { label: "Career Switch Guidance", value: "Career Switch Guidance" },
    { label: "Job Search Strategy", value: "Job Search Strategy" },
    { label: "Salary Negotiation", value: "Salary Negotiation" },
    { label: "College Admission Counseling", value: "College Admission Counseling" },
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
    { label: "System Design & Architecture", value: "System Design & Architecture" },
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
    { label: "Natural Language Processing", value: "Natural Language Processing" },
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
    { label: "Market Research & Analytics", value: "Market Research & Analytics" },
  ],
  "Health & Wellness": [
    { label: "Nutrition & Dietetics", value: "Nutrition & Dietetics" },
    { label: "Mental Health & Counseling", value: "Mental Health & Counseling" },
    { label: "Fitness & Personal Training", value: "Fitness & Personal Training" },
    { label: "Yoga & Meditation", value: "Yoga & Meditation" },
    { label: "Ayurveda", value: "Ayurveda" },
    { label: "Physiotherapy", value: "Physiotherapy" },
    { label: "Women's Health", value: "Women's Health" },
    { label: "Child & Pediatric Health", value: "Child & Pediatric Health" },
    { label: "Chronic Disease Management", value: "Chronic Disease Management" },
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
    { label: "Property & Real Estate Law", value: "Property & Real Estate Law" },
    { label: "Cyber Law", value: "Cyber Law" },
    { label: "Labour & Employment Law", value: "Labour & Employment Law" },
    { label: "Tax & GST Law", value: "Tax & GST Law" },
    { label: "Constitutional Law", value: "Constitutional Law" },
    { label: "Consumer Rights", value: "Consumer Rights" },
  ],
  "Business Strategy": [
    { label: "Startup Consulting", value: "Startup Consulting" },
    { label: "Operations Management", value: "Operations Management" },
    { label: "Product Strategy & Roadmap", value: "Product Strategy & Roadmap" },
    { label: "Growth Hacking", value: "Growth Hacking" },
    { label: "Business Development", value: "Business Development" },
    { label: "Franchising & Licensing", value: "Franchising & Licensing" },
    { label: "Supply Chain Management", value: "Supply Chain Management" },
    { label: "Project Management", value: "Project Management" },
    { label: "Fundraising & Investor Pitch", value: "Fundraising & Investor Pitch" },
    { label: "International Business", value: "International Business" },
    { label: "E-commerce Strategy", value: "E-commerce Strategy" },
  ],
  "Education & Tutoring": [
    { label: "Mathematics", value: "Mathematics" },
    { label: "Science (Physics/Chemistry/Biology)", value: "Science (Physics/Chemistry/Biology)" },
    { label: "English Language & Grammar", value: "English Language & Grammar" },
    { label: "Competitive Exams (JEE/NEET/UPSC)", value: "Competitive Exams (JEE/NEET/UPSC)" },
    { label: "Coding for Kids & Beginners", value: "Coding for Kids & Beginners" },
    { label: "History & Social Studies", value: "History & Social Studies" },
    { label: "Commerce & Accountancy", value: "Commerce & Accountancy" },
    { label: "Foreign Language Teaching", value: "Foreign Language Teaching" },
    { label: "Special Education", value: "Special Education" },
    { label: "Music & Arts Education", value: "Music & Arts Education" },
    { label: "Sports Coaching", value: "Sports Coaching" },
  ],
  "Human Resources": [
    { label: "Talent Acquisition & Recruitment", value: "Talent Acquisition & Recruitment" },
    { label: "HR Operations & Compliance", value: "HR Operations & Compliance" },
    { label: "Learning & Development (L&D)", value: "Learning & Development (L&D)" },
    { label: "Performance Management", value: "Performance Management" },
    { label: "Employee Relations & Engagement", value: "Employee Relations & Engagement" },
    { label: "Payroll & Compensation", value: "Payroll & Compensation" },
    { label: "Diversity & Inclusion", value: "Diversity & Inclusion" },
    { label: "HR Analytics", value: "HR Analytics" },
    { label: "Organizational Development", value: "Organizational Development" },
    { label: "Leadership Coaching", value: "Leadership Coaching" },
  ],
  "Civil Services & Government": [
    { label: "UPSC Civil Services (IAS/IPS/IFS)", value: "UPSC Civil Services (IAS/IPS/IFS)" },
    { label: "State PSC Exams", value: "State PSC Exams" },
    { label: "Banking & Insurance Exams", value: "Banking & Insurance Exams" },
    { label: "SSC & Railway Exams", value: "SSC & Railway Exams" },
    { label: "Defence Services (NDA/CDS/CAPF)", value: "Defence Services (NDA/CDS/CAPF)" },
    { label: "Government Policy & Governance", value: "Government Policy & Governance" },
    { label: "Public Administration", value: "Public Administration" },
  ],
  "Architecture & Design": [
    { label: "Residential Architecture", value: "Residential Architecture" },
    { label: "Interior Design", value: "Interior Design" },
    { label: "Urban & Landscape Design", value: "Urban & Landscape Design" },
    { label: "UI/UX Design", value: "UI/UX Design" },
    { label: "Graphic Design", value: "Graphic Design" },
    { label: "Product & Industrial Design", value: "Product & Industrial Design" },
    { label: "Fashion Design", value: "Fashion Design" },
    { label: "3D Modeling & Rendering", value: "3D Modeling & Rendering" },
  ],
  "Media & Journalism": [
    { label: "Print & Digital Journalism", value: "Print & Digital Journalism" },
    { label: "Broadcast & TV Journalism", value: "Broadcast & TV Journalism" },
    { label: "Photography & Videography", value: "Photography & Videography" },
    { label: "Film Making & Direction", value: "Film Making & Direction" },
    { label: "Podcast & Audio Production", value: "Podcast & Audio Production" },
    { label: "Content Writing & Copywriting", value: "Content Writing & Copywriting" },
    { label: "Social Media Content Creation", value: "Social Media Content Creation" },
  ],
  "Agriculture & Farming": [
    { label: "Organic Farming", value: "Organic Farming" },
    { label: "Hydroponics & Vertical Farming", value: "Hydroponics & Vertical Farming" },
    { label: "Agri Business & Marketing", value: "Agri Business & Marketing" },
    { label: "Animal Husbandry & Dairy", value: "Animal Husbandry & Dairy" },
    { label: "Horticulture & Floriculture", value: "Horticulture & Floriculture" },
    { label: "Government Agri Schemes", value: "Government Agri Schemes" },
    { label: "Farm Management", value: "Farm Management" },
  ],
  "Hospitality & Tourism": [
    { label: "Hotel & Resort Management", value: "Hotel & Resort Management" },
    { label: "Travel & Tourism Planning", value: "Travel & Tourism Planning" },
    { label: "Food & Beverage Management", value: "Food & Beverage Management" },
    { label: "Event Planning & Management", value: "Event Planning & Management" },
    { label: "Culinary Arts & Cooking", value: "Culinary Arts & Cooking" },
    { label: "Airlines & Airport Operations", value: "Airlines & Airport Operations" },
  ],
};

const DOMAIN_CERTIFICATE_GUIDE = {
  "Career Counseling": "Upload your Certified Career Counselor (CCC), NCDA certificate, or a relevant degree/diploma certificate (PDF or image).",
  "Software Engineering": "Upload your AWS / Google / Microsoft certification, or your CS/IT degree certificate (PDF or image).",
  "Data Science & AI": "Upload your IBM Data Science, Coursera ML, or university degree certificate in Data Science/AI (PDF or image).",
  "Finance & Investment": "Upload your CFA, CFP, CA, MBA-Finance marksheet, SEBI/NISM certificate (PDF or image).",
  "Marketing & Branding": "Upload your Google Digital Marketing, HubSpot, or MBA-Marketing degree certificate (PDF or image).",
  "Health & Wellness": "Upload your MBBS, BDS, BSc Nursing, Physiotherapy, or certified trainer/dietitian certificate (PDF or image).",
  "Legal Advisory": "Upload your LLB/LLM degree or Bar Council Enrollment certificate (PDF or image).",
  "Business Strategy": "Upload your MBA degree, CMC certification, or Business Strategy programme certificate (PDF or image).",
  "Education & Tutoring": "Upload your B.Ed/M.Ed degree, TET/CTET scorecard, or school-affiliation proof (PDF or image).",
  "Human Resources": "Upload your SHRM-CP, PHR, MBA-HR, or XLRI/TISS HR programme certificate (PDF or image).",
  "Civil Services & Government": "Upload your relevant degree, scorecard, or government exam rank letter (PDF or image).",
  "Architecture & Design": "Upload your B.Arch/M.Arch degree, COA registration, or design certification (PDF or image).",
  "Media & Journalism": "Upload your Mass Communication/Journalism degree or press card/media credential (PDF or image).",
  "Agriculture & Farming": "Upload your B.Sc Agriculture degree, Krishi Vigyan Kendra certificate, or relevant diploma (PDF or image).",
  "Hospitality & Tourism": "Upload your Hotel Management degree, IATA certification, or relevant hospitality diploma (PDF or image).",
  Other: "Upload any official certificate, degree, or document that proves your expertise in your domain (PDF or image).",
};

// ─── Reusable dropdown ────────────────────────────────────────────────────────
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
          {selected ? selected.label : label}
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

// ─── Skills picker ────────────────────────────────────────────────────────────
function SkillsPicker({ selectedSkills, onChange, domain }) {
  const [visible, setVisible] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const skillList = domain && DOMAIN_SKILLS_MAP[domain]
    ? DOMAIN_SKILLS_MAP[domain]
    : SKILL_OPTIONS;

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length >= 5) {
        Alert.alert("Max 5 skills");
        return;
      }
      onChange([...selectedSkills, skill]);
    }
  };

  const addCustom = () => {
    const t = customSkill.trim();
    if (!t) return;
    if (selectedSkills.includes(t)) {
      Alert.alert("Already added");
      return;
    }
    if (selectedSkills.length >= 5) {
      Alert.alert("Max 5 skills");
      return;
    }
    onChange([...selectedSkills, t]);
    setCustomSkill("");
  };

  return (
    <>
      <View style={styles.selectedSkillsContainer}>
        {selectedSkills.length === 0 ? (
          <Text style={{ color: "#777", fontSize: 13 }}>
            No skills selected
          </Text>
        ) : (
          selectedSkills.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={styles.skillChip}
              onPress={() => toggleSkill(skill)}
            >
              <Text style={styles.skillChipText}>{skill}</Text>
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
        style={styles.addSkillsBtn}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={18} color="#0B2D72" />
        <Text style={styles.addSkillsBtnText}>
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
            <Text style={{ color: "#0B2D72", textAlign: "center", marginBottom: 4, fontSize: 12, fontWeight: "600" }}>
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
          <View style={styles.customSkillRow}>
            <TextInput
              style={styles.customSkillInput}
              placeholder="Add custom skill..."
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity
              style={styles.customSkillAddBtn}
              onPress={addCustom}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={skillList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSel = selectedSkills.includes(item);
              return (
                <TouchableOpacity
                  style={[styles.modalItem, isSel && styles.modalItemSelected]}
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
                        color: isSel ? "#0B2D72" : "#333",
                        fontWeight: isSel ? "700" : "400",
                      }}
                    >
                      {item}
                    </Text>
                    {isSel && (
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
            style={[styles.submitBtn, { marginTop: 10 }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.submitText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ─── Languages picker ─────────────────────────────────────────────────────────
function LanguagesPicker({ selectedLanguages, onChange }) {
  const [visible, setVisible] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const toggle = (lang) => {
    if (selectedLanguages.includes(lang)) {
      onChange(selectedLanguages.filter((l) => l !== lang));
    } else {
      if (selectedLanguages.length >= 5) {
        Alert.alert("Max 5 languages");
        return;
      }
      onChange([...selectedLanguages, lang]);
    }
  };

  const addCustom = () => {
    const t = customLang.trim();
    if (!t) return;
    if (selectedLanguages.includes(t)) {
      Alert.alert("Already added");
      return;
    }
    if (selectedLanguages.length >= 5) {
      Alert.alert("Max 5 languages");
      return;
    }
    onChange([...selectedLanguages, t]);
    setCustomLang("");
  };

  return (
    <>
      <View style={styles.selectedSkillsContainer}>
        {selectedLanguages.length === 0 ? (
          <Text style={{ color: "#777", fontSize: 13 }}>
            No languages selected
          </Text>
        ) : (
          selectedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={styles.skillChip}
              onPress={() => toggle(lang)}
            >
              <Text style={styles.skillChipText}>{lang}</Text>
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
        style={styles.addSkillsBtn}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={18} color="#0B2D72" />
        <Text style={styles.addSkillsBtnText}>
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
          <View style={styles.customSkillRow}>
            <TextInput
              style={styles.customSkillInput}
              placeholder="Add custom language..."
              value={customLang}
              onChangeText={setCustomLang}
            />
            <TouchableOpacity
              style={styles.customSkillAddBtn}
              onPress={addCustom}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGE_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSel = selectedLanguages.includes(item);
              return (
                <TouchableOpacity
                  style={[styles.modalItem, isSel && styles.modalItemSelected]}
                  onPress={() => toggle(item)}
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
                        color: isSel ? "#0B2D72" : "#333",
                        fontWeight: isSel ? "700" : "400",
                      }}
                    >
                      {item}
                    </Text>
                    {isSel && (
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
            style={[styles.submitBtn, { marginTop: 10 }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.submitText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ─── Inline field error ───────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: 4,
      }}
    >
      <Ionicons name="alert-circle" size={13} color="#e53935" />
      <Text style={styles.fieldError}>{message}</Text>
    </View>
  );
}

// ─── Certificate upload section ───────────────────────────────────────────────
function CertificateUploadSection({ domain, certFile, onPick, error }) {
  const guide = domain ? DOMAIN_CERTIFICATE_GUIDE[domain] : null;
  return (
    <View style={{ marginTop: 6 }}>
      {domain ? (
        <View style={styles.certInfoBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color="#0B2D72"
            style={{ marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={styles.certInfoTitle}
            >{`Required proof for "${domain}"`}</Text>
            <Text style={styles.certInfoText}>{guide}</Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.certInfoBox,
            { borderLeftColor: "#e07b00", backgroundColor: "#fff8ee" },
          ]}
        >
          <Ionicons
            name="warning-outline"
            size={18}
            color="#e07b00"
            style={{ marginTop: 2 }}
          />
          <Text style={[styles.certInfoText, { color: "#e07b00", flex: 1 }]}>
            Please select your domain first — the required certificate type will
            appear here.
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.certUploadBtn,
          certFile && styles.certUploadBtnSuccess,
          error && !certFile && styles.certUploadBtnError,
          !domain && { opacity: 0.45 },
        ]}
        onPress={
          domain
            ? onPick
            : () =>
                Alert.alert(
                  "Select domain first",
                  "Please choose your domain before uploading a certificate.",
                )
        }
        activeOpacity={domain ? 0.7 : 1}
      >
        <Ionicons
          name={certFile ? "document-attach" : "cloud-upload-outline"}
          size={24}
          color={certFile ? "#1a7f37" : error ? "#e53935" : "#0B2D72"}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          {certFile ? (
            <>
              <Text style={styles.certFileNameText} numberOfLines={1}>
                {certFile.name}
              </Text>
              <Text style={{ fontSize: 11, color: "#1a7f37", marginTop: 2 }}>
                ✓ Certificate uploaded — tap to replace
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[styles.certUploadLabel, error && { color: "#e53935" }]}
              >
                Tap to upload certificate *
              </Text>
              <Text style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                Accepted: PDF, JPG, PNG
              </Text>
            </>
          )}
        </View>
        {certFile && (
          <Ionicons name="checkmark-circle" size={24} color="#1a7f37" />
        )}
      </TouchableOpacity>
      <FieldError message={error} />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [role, setRole] = useState("Jobseeker");
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    dob: "",
    qualification: "",
    customQualification: "",
    experience: "",
    customExperience: "",
    cv: null,
    image: null,
    certFile: null,
    languages: "",
    customLanguages: "",
    location: "",
    customLocation: "",
    bio: "",
    domain: "",
    customDomain: "",
    sub_domain: "",
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNameChange = (value) => {
    const cleaned = value.replace(/[^a-zA-Z\s]/g, "");
    setField("fullName", cleaned);
    if (cleaned.trim().length < 2)
      setErrors((p) => ({
        ...p,
        fullName: "Name must have at least 2 letters (letters only)",
      }));
    else setErrors((p) => ({ ...p, fullName: "" }));
  };

  const handleEmailChange = (value) => {
    const lower = value.toLowerCase();
    setField("email", lower);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower))
      setErrors((p) => ({
        ...p,
        email: "Enter a valid email (no capital letters allowed)",
      }));
    else setErrors((p) => ({ ...p, email: "" }));
  };

  const onChangeDate = (event, selectedDate) => {
    const current = selectedDate || date;
    setShow(false);
    setDate(current);
    const formatted =
      current.getFullYear() +
      "-" +
      String(current.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(current.getDate()).padStart(2, "0");
    setField("dob", formatted);
  };

  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) setField("cv", result.assets[0]);
  };

  const pickCertificate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setField("certFile", result.assets[0]);
        setErrors((p) => ({ ...p, certFile: "" }));
      }
    } catch {
      Alert.alert("Error", "Could not open file picker. Please try again.");
    }
  };

  const pickImage = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted)
      return Alert.alert("Permission Required", "Enable gallery access.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setField("image", result.assets[0]);
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2)
      e.fullName = "Full name is required (letters only, min 2 chars)";
    else if (/[^a-zA-Z\s]/.test(formData.fullName))
      e.fullName = "Name must contain letters only";

    if (!formData.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email address";

    if (!formData.gender) e.gender = "Gender is required";

    if (!formData.dob) e.dob = "Birth date is required";

    if (!formData.qualification) e.qualification = "Qualification is required";
    else if (
      formData.qualification === "Other" &&
      !formData.customQualification.trim()
    )
      e.customQualification = "Please specify your qualification";

    if (!formData.experience) e.experience = "Experience is required";
    else if (
      formData.experience === "Other" &&
      !formData.customExperience.trim()
    )
      e.customExperience = "Please specify your experience";

    if (!formData.cv) e.cv = "Please upload your CV";

    if (role === "Expert") {
      if (!formData.domain) e.domain = "Domain is required for Experts";
      else if (formData.domain === "Other" && !formData.customDomain.trim())
        e.customDomain = "Please specify your domain";

      if (selectedSkills.length === 0)
        e.skills = "Please select at least 1 skill";

      if (!formData.certFile)
        e.certFile =
          "Please upload your certificate — this is required to verify your domain expertise";

      if (formData.location === "Other" && !formData.customLocation.trim())
        e.customLocation = "Please specify your city";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const submitProfile = async () => {
    if (!validate()) {
      Alert.alert(
        "Validation Error",
        "Please fix the highlighted fields before submitting.",
      );
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Login Required");

      await axios.post(
        `${BASE_URL}/api/auth/set-role`,
        { role: role.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const form = new FormData();
      form.append("role", role.toLowerCase());
      form.append("gender", formData.gender?.toLowerCase());

      const resolvedDomain =
        formData.domain === "Other" ? formData.customDomain : formData.domain;

      const resolvedData = {
        ...formData,
        domain: resolvedDomain || null,
        sub_domain: formData.sub_domain || null,
        location:
          formData.location === "Other"
            ? formData.customLocation
            : formData.location,
        qualification:
          formData.qualification === "Other"
            ? formData.customQualification
            : formData.qualification,
        experience:
          formData.experience === "Other"
            ? formData.customExperience
            : formData.experience,
        languages:
          selectedLanguages.length > 0
            ? selectedLanguages.join(", ")
            : formData.languages,
        isVerified: role === "Expert" ? true : false,
        verificationStatus: role === "Expert" ? "approved" : "none",
      };

      const skipFields = [
        "cv", "image", "certFile", "customLocation",
        "customQualification", "customExperience",
        "customLanguages", "customDomain", "gender",
      ];

      Object.keys(resolvedData).forEach((key) => {
        if (
          !skipFields.includes(key) &&
          resolvedData[key] !== "" &&
          resolvedData[key] !== null &&
          resolvedData[key] !== undefined
        ) {
          form.append(key, resolvedData[key]);
        }
      });

      if (selectedSkills.length > 0)
        form.append("skills", selectedSkills.join(", "));

      if (formData.cv) {
        const cleanUri = formData.cv.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();
        form.append("cv", {
          uri: cleanUri,
          name: formData.cv.name || `cv.${ext}`,
          type: ext === "pdf" ? "application/pdf" : `image/${ext}`,
        });
      }

      if (formData.image) {
        const cleanUri = formData.image.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();
        form.append("image", {
          uri: cleanUri,
          name: `profile.${ext}`,
          type: `image/${ext}`,
        });
      }

      if (role === "Expert" && formData.certFile) {
        const cleanUri = formData.certFile.uri.split("?")[0];
        const ext = cleanUri.split(".").pop().toLowerCase();
        const mimeMap = {
          pdf: "application/pdf",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
        };
        form.append("certificate", {
          uri: cleanUri,
          name: formData.certFile.name || `certificate.${ext}`,
          type: mimeMap[ext] || "application/octet-stream",
        });
        form.append("certificateDomain", resolvedDomain);
      }

      // ✅ FIX: was hardcoded to wrong IP 192.168.1.17 — now uses BASE_URL
      await axios.post(
        `${BASE_URL}/api/users/save-profile`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const userStr = await AsyncStorage.getItem("user");
      const existingUser = userStr ? JSON.parse(userStr) : {};
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          role: role.toLowerCase(),
          hasProfile: true,
          isVerified: role === "Expert",
        }),
      );

      Alert.alert(
        role === "Expert" ? "✅ Profile Verified & Saved" : "✅ Profile Saved",
        role === "Expert"
          ? "Your certificate has been uploaded and your expert profile is now verified!"
          : "Your profile has been saved successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/dashboard/dashboard"),
          },
        ],
      );
    } catch (e) {
      console.log("Submit error:", e.response?.data || e.message);
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not save profile",
      );
    }
  };

  const displayDomain =
    formData.domain === "Other"
      ? formData.customDomain || "Other"
      : formData.domain;

  const subDomainOptions = SUBDOMAIN_MAP[formData.domain] || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Profile Information</Text>

          {/* ── Profile image ── */}
          <Text style={styles.label}>Profile Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {formData.image ? (
              <Image
                source={{ uri: formData.image.uri }}
                style={styles.imagePreview}
              />
            ) : (
              <Text
                style={{ color: "#777", fontSize: 13, textAlign: "center" }}
              >
                📷{"\n"}Choose Photo
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Role toggle ── */}
          <Text style={styles.label}>Select Role</Text>
          <View style={styles.roleRow}>
            {["Jobseeker", "Expert"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.roleBtn, role === item && styles.roleSelected]}
                onPress={() => setRole(item)}
              >
                <Text
                  style={[styles.roleText, role === item && { color: "#fff" }]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Full name ── */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Enter full name (letters only)"
            value={formData.fullName}
            onChangeText={handleNameChange}
          />
          <FieldError message={errors.fullName} />

          {/* ── Email ── */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter email (lowercase only)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={handleEmailChange}
          />
          <FieldError message={errors.email} />

          {/* ── Gender ── */}
          <Text style={styles.label}>Gender *</Text>
          <View
            style={[
              styles.input,
              errors.gender && styles.inputError,
              {
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
              },
            ]}
          >
            {["male", "female", "other"].map((option) => (
              <TouchableOpacity
                key={option}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                onPress={() => setField("gender", option)}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: "#0B2D72",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {formData.gender === option && (
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 5,
                        backgroundColor: "#0B2D72",
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#333",
                    textTransform: "capitalize",
                  }}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FieldError message={errors.gender} />

          {/* ── DOB ── */}
          <Text style={styles.label}>Birth Date *</Text>
          <TouchableOpacity
            style={[styles.input, errors.dob && styles.inputError]}
            onPress={() => setShow(true)}
          >
            <Text style={{ color: formData.dob ? "#000" : "#777" }}>
              {formData.dob || "Select Birth Date"}
            </Text>
          </TouchableOpacity>
          <FieldError message={errors.dob} />
          {show && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={onChangeDate}
            />
          )}

          {/* ── Domain ── */}
          <Text style={styles.label}>Domain * (Your Expertise Area)</Text>
          <DropdownPicker
            label="Select Domain"
            value={formData.domain}
            onChange={(v) => {
              setField("domain", v);
              setField("certFile", null);
              setField("customDomain", "");
              setField("sub_domain", "");       // ✅ reset sub_domain
              setSelectedSkills([]);             // ✅ reset skills for new domain
            }}
            options={DOMAIN_OPTIONS}
          />
          <FieldError message={errors.domain} />
          {formData.domain === "Other" && (
            <>
              <TextInput
                style={[
                  styles.input,
                  styles.otherInput,
                  errors.customDomain && styles.inputError,
                ]}
                placeholder="Please specify your domain..."
                value={formData.customDomain}
                onChangeText={(v) => setField("customDomain", v)}
              />
              <FieldError message={errors.customDomain} />
            </>
          )}

          {/* ✅ Sub-Domain picker — only shows when domain is selected */}
          {subDomainOptions.length > 0 && (
            <>
              <Text style={styles.label}>Sub-Domain</Text>
              <DropdownPicker
                label="Select Sub-Domain"
                value={formData.sub_domain}
                options={subDomainOptions}
                onChange={(v) => setField("sub_domain", v)}
              />
            </>
          )}

          {/* ── Qualification ── */}
          <Text style={styles.label}>Qualification *</Text>
          <DropdownPicker
            label="Select Qualification"
            value={formData.qualification}
            onChange={(v) => setField("qualification", v)}
            options={[
              { label: "Graduate", value: "Graduate" },
              { label: "Post Graduate", value: "PG" },
              { label: "Diploma", value: "Diploma" },
              { label: "Marathi Medium", value: "Marathi Medium" },
              { label: "Other", value: "Other" },
            ]}
          />
          <FieldError message={errors.qualification} />
          {formData.qualification === "Other" && (
            <>
              <TextInput
                style={[
                  styles.input,
                  styles.otherInput,
                  errors.customQualification && styles.inputError,
                ]}
                placeholder="Please specify your qualification..."
                value={formData.customQualification}
                onChangeText={(v) => setField("customQualification", v)}
              />
              <FieldError message={errors.customQualification} />
            </>
          )}

          {/* ── Experience ── */}
          <Text style={styles.label}>Experience *</Text>
          <DropdownPicker
            label="Select Experience"
            value={formData.experience}
            onChange={(v) => setField("experience", v)}
            options={[
              { label: "Fresher", value: "0" },
              { label: "1 Year", value: "1" },
              { label: "2 Years", value: "2" },
              { label: "3 Years", value: "3" },
              { label: "5 Years", value: "5" },
              { label: "8+ Years", value: "8" },
              { label: "Other", value: "Other" },
            ]}
          />
          <FieldError message={errors.experience} />
          {formData.experience === "Other" && (
            <>
              <TextInput
                style={[
                  styles.input,
                  styles.otherInput,
                  errors.customExperience && styles.inputError,
                ]}
                placeholder="Enter years of experience"
                keyboardType="numeric"
                value={formData.customExperience}
                onChangeText={(v) => setField("customExperience", v)}
              />
              <FieldError message={errors.customExperience} />
            </>
          )}

          {/* ── CV ── */}
          <Text style={styles.label}>Upload CV *</Text>
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              errors.cv && { borderWidth: 1.5, borderColor: "#e53935" },
            ]}
            onPress={pickCV}
          >
            <Ionicons
              name="document-outline"
              size={18}
              color="#0B2D72"
              style={{ marginRight: 8 }}
            />
            <Text style={{ fontWeight: "600", flex: 1 }} numberOfLines={1}>
              {formData.cv ? formData.cv.name : "Choose CV file (PDF)"}
            </Text>
            {formData.cv && (
              <Ionicons name="checkmark-circle" size={18} color="#1a7f37" />
            )}
          </TouchableOpacity>
          <FieldError message={errors.cv} />

          {/* ══ EXPERT ONLY ══ */}
          {role === "Expert" && (
            <>
              <Text style={styles.label}>Skills * (select up to 5)</Text>
              {formData.domain && DOMAIN_SKILLS_MAP[formData.domain] && (
                <Text style={{ fontSize: 12, color: "#0B2D72", marginTop: 4, fontWeight: "600" }}>
                  💡 Showing skills for: {formData.domain}
                </Text>
              )}
              <SkillsPicker
                selectedSkills={selectedSkills}
                onChange={setSelectedSkills}
                domain={formData.domain}
              />
              <FieldError message={errors.skills} />

              <Text style={styles.label}>
                Domain Certificate / Proof of Expertise *
              </Text>
              <CertificateUploadSection
                domain={displayDomain}
                certFile={formData.certFile}
                onPick={pickCertificate}
                error={errors.certFile}
              />

              <Text style={styles.label}>Languages Known</Text>
              <LanguagesPicker
                selectedLanguages={selectedLanguages}
                onChange={setSelectedLanguages}
              />

              <Text style={styles.label}>City</Text>
              <DropdownPicker
                label="Select Location"
                value={formData.location}
                onChange={(v) => setField("location", v)}
                options={[
                  { label: "Mumbai", value: "Mumbai" },
                  { label: "Pune", value: "Pune" },
                  { label: "Nashik", value: "Nashik" },
                  { label: "Nagpur", value: "Nagpur" },
                  { label: "Chhatrapati SambhajiNagar", value: "Chhatrapati SambhajiNagar" },
                  { label: "Other", value: "Other" },
                ]}
              />
              {formData.location === "Other" && (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      styles.otherInput,
                      errors.customLocation && styles.inputError,
                    ]}
                    placeholder="Please enter your city name..."
                    value={formData.customLocation}
                    onChangeText={(v) => setField("customLocation", v)}
                  />
                  <FieldError message={errors.customLocation} />
                </>
              )}

              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                multiline
                placeholder="Short bio about yourself..."
                onChangeText={(v) => setField("bio", v)}
              />
            </>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={submitProfile}>
            <Text style={styles.submitText}>
              {role === "Expert" ? "Submit & Get Verified ✓" : "Submit"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0B2D72",
    marginBottom: 10,
  },
  label: { marginTop: 15, fontSize: 16, fontWeight: "600", color: "#0B2D72" },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 8,
    marginTop: 5,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#e53935",
    backgroundColor: "#fff5f5",
  },
  otherInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#0B2D72",
    borderStyle: "dashed",
    backgroundColor: "#f0f4ff",
  },
  fieldError: { color: "#e53935", fontSize: 12 },
  dropdownBox: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 8,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  roleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0B2D72",
    alignItems: "center",
  },
  roleSelected: { backgroundColor: "#0B2D72" },
  roleText: { color: "#0B2D72", fontWeight: "600" },
  uploadBtn: {
    backgroundColor: "#e5e7eb",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: "#0B2D72",
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
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
  imagePicker: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    backgroundColor: "#f3f4f6",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    overflow: "hidden",
  },
  imagePreview: { width: 110, height: 110, borderRadius: 55 },
  selectedSkillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    minHeight: 40,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B2D72",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillChipText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  addSkillsBtn: {
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
  addSkillsBtnText: { color: "#0B2D72", fontWeight: "600" },
  customSkillRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  customSkillInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
  customSkillAddBtn: {
    backgroundColor: "#0B2D72",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  certInfoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0B2D72",
    marginBottom: 10,
  },
  certInfoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B2D72",
    marginBottom: 3,
  },
  certInfoText: { fontSize: 13, color: "#444", lineHeight: 19 },
  certUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0B2D72",
    borderStyle: "dashed",
    backgroundColor: "#f8faff",
  },
  certUploadBtnSuccess: {
    borderStyle: "solid",
    borderColor: "#1a7f37",
    backgroundColor: "#f0fff4",
  },
  certUploadBtnError: {
    borderStyle: "solid",
    borderColor: "#e53935",
    backgroundColor: "#fff5f5",
  },
  certUploadLabel: { fontSize: 15, fontWeight: "600", color: "#0B2D72" },
  certFileNameText: { fontSize: 14, fontWeight: "600", color: "#1a7f37" },
});