export type Job = {
  id: string;
  title: string;
  companyId: string;
  location: string;
  remote: boolean;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  category: string;
  experience: string;
  education: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  deadline: string;
  postedAt: string;
  applicants: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  employees: string;
  verified: boolean;
  initials: string;
  about: string;
};

export const categories = [
  { name: "Software & IT", count: 148 },
  { name: "Banking & Finance", count: 96 },
  { name: "Health & Medicine", count: 74 },
  { name: "Engineering", count: 63 },
  { name: "Sales & Marketing", count: 58 },
  { name: "Logistics & Supply", count: 41 },
  { name: "Education", count: 37 },
  { name: "NGO & Development", count: 52 },
];

export const companies: Company[] = [
  {
    id: "abyssinia-tech",
    name: "Abyssinia Tech Labs",
    industry: "Software & IT",
    location: "Bole, Addis Ababa",
    website: "abyssiniatech.et",
    employees: "51-200",
    verified: true,
    initials: "AT",
    about:
      "Abyssinia Tech Labs builds payment and logistics software used by more than 400 Ethiopian businesses. Our engineering team works across web, mobile and data platforms.",
  },
  {
    id: "dashen-bank",
    name: "Dashen Financial Group",
    industry: "Banking & Finance",
    location: "Kazanchis, Addis Ababa",
    website: "dashenfg.et",
    employees: "1000+",
    verified: true,
    initials: "DF",
    about:
      "A full-service financial group serving retail and corporate clients in every region of Ethiopia, with a growing digital banking division.",
  },
  {
    id: "sheba-health",
    name: "Sheba Health Network",
    industry: "Health & Medicine",
    location: "Hawassa",
    website: "shebahealth.et",
    employees: "201-500",
    verified: true,
    initials: "SH",
    about:
      "A network of clinics and diagnostic centers across the southern region, focused on affordable specialist care.",
  },
  {
    id: "rift-valley-logistics",
    name: "Rift Valley Logistics",
    industry: "Logistics & Supply",
    location: "Adama",
    website: "rvlogistics.et",
    employees: "201-500",
    verified: false,
    initials: "RV",
    about:
      "Freight forwarding and warehousing along the Addis–Djibouti corridor, moving over 12,000 containers each year.",
  },
  {
    id: "meskel-media",
    name: "Meskel Media House",
    industry: "Sales & Marketing",
    location: "Piassa, Addis Ababa",
    website: "meskelmedia.et",
    employees: "11-50",
    verified: true,
    initials: "MM",
    about:
      "A creative agency producing brand campaigns, film and social content for Ethiopian and pan-African brands.",
  },
  {
    id: "green-highlands",
    name: "Green Highlands Agro",
    industry: "Engineering",
    location: "Bahir Dar",
    website: "greenhighlands.et",
    employees: "501-1000",
    verified: false,
    initials: "GH",
    about:
      "Agro-processing and irrigation engineering company working with smallholder cooperatives around Lake Tana.",
  },
];

export const jobs: Job[] = [
  {
    id: "senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    companyId: "abyssinia-tech",
    location: "Addis Ababa",
    remote: true,
    employmentType: "Full-time",
    category: "Software & IT",
    experience: "5+ years",
    education: "BSc in Computer Science or related",
    salaryMin: 65000,
    salaryMax: 95000,
    currency: "ETB",
    deadline: "2026-09-12",
    postedAt: "2026-08-01",
    applicants: 34,
    description:
      "Lead the frontend of our merchant dashboard used daily by thousands of Ethiopian businesses. You will own architecture decisions, mentor two mid-level engineers and work closely with product and design.",
    requirements: [
      "5+ years building production React applications",
      "Strong TypeScript and modern CSS skills",
      "Experience with performance profiling and accessibility",
      "Comfortable working with REST APIs and auth flows",
    ],
    responsibilities: [
      "Design and ship features in the merchant dashboard",
      "Set frontend standards and review code",
      "Partner with designers on a shared component library",
    ],
    skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs", "Testing"],
  },
  {
    id: "credit-analyst",
    title: "Corporate Credit Analyst",
    companyId: "dashen-bank",
    location: "Addis Ababa",
    remote: false,
    employmentType: "Full-time",
    category: "Banking & Finance",
    experience: "3-5 years",
    education: "BA in Accounting, Finance or Economics",
    salaryMin: 42000,
    salaryMax: 58000,
    currency: "ETB",
    deadline: "2026-08-29",
    postedAt: "2026-08-03",
    applicants: 61,
    description:
      "Assess credit applications from corporate clients, build financial models and present recommendations to the credit committee.",
    requirements: [
      "3+ years in credit or financial analysis",
      "Strong financial modelling in Excel",
      "Knowledge of NBE directives",
    ],
    responsibilities: [
      "Review and score corporate loan applications",
      "Prepare credit memos for the committee",
      "Monitor portfolio risk indicators",
    ],
    skills: ["Financial Modelling", "Risk Analysis", "Excel", "Reporting"],
  },
  {
    id: "registered-nurse",
    title: "Registered Nurse – Outpatient",
    companyId: "sheba-health",
    location: "Hawassa",
    remote: false,
    employmentType: "Full-time",
    category: "Health & Medicine",
    experience: "2-4 years",
    education: "BSc in Nursing",
    salaryMin: 22000,
    salaryMax: 31000,
    currency: "ETB",
    deadline: "2026-09-02",
    postedAt: "2026-07-28",
    applicants: 47,
    description:
      "Provide outpatient nursing care at our Hawassa center, supporting general practice and specialist clinics.",
    requirements: [
      "Valid nursing license",
      "2+ years outpatient experience",
      "Amharic and Sidaamu Afoo an advantage",
    ],
    responsibilities: [
      "Triage and assess walk-in patients",
      "Assist physicians during procedures",
      "Maintain accurate patient records",
    ],
    skills: ["Patient Care", "Triage", "Record Keeping"],
  },
  {
    id: "logistics-coordinator",
    title: "Logistics Coordinator",
    companyId: "rift-valley-logistics",
    location: "Adama",
    remote: false,
    employmentType: "Contract",
    category: "Logistics & Supply",
    experience: "1-3 years",
    education: "Diploma or BA in Logistics",
    salaryMin: 18000,
    salaryMax: 26000,
    currency: "ETB",
    deadline: "2026-08-22",
    postedAt: "2026-08-04",
    applicants: 19,
    description:
      "Coordinate truck scheduling and customs documentation for shipments moving along the Addis–Djibouti corridor.",
    requirements: [
      "Experience with freight documentation",
      "Familiarity with ERCA customs procedures",
      "Strong coordination and follow-up skills",
    ],
    responsibilities: [
      "Schedule fleet movements daily",
      "Track shipments and resolve delays",
      "Prepare customs paperwork",
    ],
    skills: ["Fleet Scheduling", "Customs", "Coordination"],
  },
  {
    id: "brand-strategist",
    title: "Brand Strategist",
    companyId: "meskel-media",
    location: "Addis Ababa",
    remote: true,
    employmentType: "Full-time",
    category: "Sales & Marketing",
    experience: "3-5 years",
    education: "BA in Marketing or Communications",
    salaryMin: 35000,
    salaryMax: 50000,
    currency: "ETB",
    deadline: "2026-09-18",
    postedAt: "2026-08-05",
    applicants: 12,
    description:
      "Shape positioning and campaign strategy for consumer brands launching across Ethiopia and East Africa.",
    requirements: [
      "Portfolio of brand or campaign work",
      "Strong written Amharic and English",
      "Comfortable presenting to senior clients",
    ],
    responsibilities: [
      "Run brand discovery workshops",
      "Write strategy and messaging decks",
      "Brief creative teams and review output",
    ],
    skills: ["Brand Strategy", "Copywriting", "Research", "Presenting"],
  },
  {
    id: "irrigation-engineer",
    title: "Irrigation Engineer",
    companyId: "green-highlands",
    location: "Bahir Dar",
    remote: false,
    employmentType: "Full-time",
    category: "Engineering",
    experience: "4-6 years",
    education: "BSc in Civil or Water Resources Engineering",
    salaryMin: 30000,
    salaryMax: 45000,
    currency: "ETB",
    deadline: "2026-08-27",
    postedAt: "2026-07-30",
    applicants: 23,
    description:
      "Design and supervise irrigation schemes serving smallholder cooperatives around Lake Tana.",
    requirements: [
      "4+ years designing irrigation systems",
      "AutoCAD and hydraulic modelling skills",
      "Willingness to travel to field sites",
    ],
    responsibilities: [
      "Produce scheme designs and BOQs",
      "Supervise contractors on site",
      "Train cooperative technicians",
    ],
    skills: ["AutoCAD", "Hydraulics", "Site Supervision"],
  },
  {
    id: "junior-data-analyst",
    title: "Junior Data Analyst",
    companyId: "abyssinia-tech",
    location: "Addis Ababa",
    remote: false,
    employmentType: "Internship",
    category: "Software & IT",
    experience: "0-1 years",
    education: "BSc in Statistics, CS or Economics",
    salaryMin: 9000,
    salaryMax: 14000,
    currency: "ETB",
    deadline: "2026-08-20",
    postedAt: "2026-08-02",
    applicants: 88,
    description:
      "A six-month paid internship supporting the analytics team with reporting, dashboards and data quality work.",
    requirements: [
      "SQL fundamentals",
      "Comfort with spreadsheets and charts",
      "Recent graduate or final-year student",
    ],
    responsibilities: [
      "Build weekly reporting dashboards",
      "Clean and validate product data",
      "Support ad-hoc analysis requests",
    ],
    skills: ["SQL", "Excel", "Data Visualization"],
  },
  {
    id: "secondary-school-teacher",
    title: "Secondary School Mathematics Teacher",
    companyId: "sheba-health",
    location: "Hawassa",
    remote: false,
    employmentType: "Part-time",
    category: "Education",
    experience: "2-4 years",
    education: "BEd in Mathematics",
    salaryMin: 14000,
    salaryMax: 20000,
    currency: "ETB",
    deadline: "2026-09-05",
    postedAt: "2026-07-26",
    applicants: 29,
    description:
      "Teach mathematics to grades 9–12 at our staff community school, three days a week.",
    requirements: [
      "Licensed teacher with 2+ years experience",
      "Strong classroom management",
    ],
    responsibilities: [
      "Plan and deliver lessons",
      "Assess and report on student progress",
    ],
    skills: ["Lesson Planning", "Assessment", "Mentoring"],
  },
];

export const locations = [
  "Addis Ababa",
  "Adama",
  "Bahir Dar",
  "Hawassa",
  "Dire Dawa",
  "Mekelle",
];

export const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
] as const;

export function getCompany(id: string) {
  return companies.find((c) => c.id === id);
}

export function getJob(id: string) {
  return jobs.find((j) => j.id === id);
}

export function formatSalary(job: Job) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)} ${job.currency}/mo`;
}

export function daysLeft(deadline: string, now = new Date("2026-08-05")) {
  const diff = Math.ceil(
    (new Date(deadline).getTime() - now.getTime()) / 86400000,
  );
  return diff;
}
