export interface JobRole {
  id: string;
  title: string;
  department: string;
  location: string;
  openPositions: number;
  description: string;
  isHot?: boolean;
}

export const departments = [
  "All Departments",
  "Customer Support",
  "Operations",
  "Technology",
  "Marketing",
  "Sales",
  "Finance",
  "Legal & Compliance",
  "Human Resources",
  "Product",
  "Design",
] as const;

export const locations = [
  "All Locations",
  "Remote (US)",
  "New York, NY",
  "San Francisco, CA",
  "Austin, TX",
  "Chicago, IL",
  "Miami, FL",
  "Seattle, WA",
  "Denver, CO",
] as const;

export const jobRoles: JobRole[] = [
  // Customer Support
  { id: "cs-1", title: "Customer Support Executive", department: "Customer Support", location: "Remote (US)", openPositions: 5, description: "Handle customer queries and deliver seamless travel support.", isHot: true },
  { id: "cs-2", title: "Senior Support Specialist", department: "Customer Support", location: "New York, NY", openPositions: 3, description: "Lead support escalations and mentor junior team members." },
  { id: "cs-3", title: "Chat Support Agent", department: "Customer Support", location: "Remote (US)", openPositions: 8, description: "Provide real-time assistance via live chat for booking inquiries.", isHot: true },
  { id: "cs-4", title: "Customer Experience Manager", department: "Customer Support", location: "Austin, TX", openPositions: 2, description: "Design and improve end-to-end customer experience journeys." },
  { id: "cs-5", title: "Multilingual Support Agent", department: "Customer Support", location: "Miami, FL", openPositions: 4, description: "Assist customers in multiple languages across global markets." },

  // Operations
  { id: "ops-1", title: "Flight Booking Specialist", department: "Operations", location: "Remote (US)", openPositions: 8, description: "Manage booking operations for US-based travel customers.", isHot: true },
  { id: "ops-2", title: "Hotel Reservations Coordinator", department: "Operations", location: "Chicago, IL", openPositions: 4, description: "Coordinate hotel bookings and handle reservation modifications." },
  { id: "ops-3", title: "Travel Operations Analyst", department: "Operations", location: "New York, NY", openPositions: 3, description: "Analyze operational data to optimize travel service delivery." },
  { id: "ops-4", title: "GDS Specialist (Amadeus/Sabre)", department: "Operations", location: "Remote (US)", openPositions: 5, description: "Operate GDS platforms for fare searches and ticketing.", isHot: true },
  { id: "ops-5", title: "Ground Transport Coordinator", department: "Operations", location: "San Francisco, CA", openPositions: 2, description: "Manage car rental and airport transfer logistics." },
  { id: "ops-6", title: "Visa & Documentation Specialist", department: "Operations", location: "New York, NY", openPositions: 3, description: "Guide customers through visa applications and travel documentation." },

  // Technology
  { id: "tech-1", title: "Frontend Developer (React)", department: "Technology", location: "Remote (US)", openPositions: 3, description: "Develop responsive interfaces for high-scale travel platforms.", isHot: true },
  { id: "tech-2", title: "Backend Developer (Node.js)", department: "Technology", location: "San Francisco, CA", openPositions: 3, description: "Build robust APIs powering real-time booking and pricing engines." },
  { id: "tech-3", title: "Full Stack Developer", department: "Technology", location: "Remote (US)", openPositions: 4, description: "Deliver end-to-end features across web and mobile platforms." },
  { id: "tech-4", title: "Mobile App Developer (React Native)", department: "Technology", location: "Austin, TX", openPositions: 2, description: "Build cross-platform mobile experiences for travelers." },
  { id: "tech-5", title: "DevOps Engineer", department: "Technology", location: "Seattle, WA", openPositions: 2, description: "Maintain CI/CD pipelines and cloud infrastructure on AWS." },
  { id: "tech-6", title: "QA Engineer", department: "Technology", location: "Remote (US)", openPositions: 3, description: "Ensure quality through automated and manual testing strategies." },
  { id: "tech-7", title: "Data Engineer", department: "Technology", location: "San Francisco, CA", openPositions: 2, description: "Build data pipelines for analytics and business intelligence." },
  { id: "tech-8", title: "AI/ML Engineer", department: "Technology", location: "Remote (US)", openPositions: 2, description: "Develop intelligent pricing and recommendation systems." },

  // Marketing
  { id: "mkt-1", title: "Digital Marketing Executive", department: "Marketing", location: "New York, NY", openPositions: 4, description: "Drive growth through creative campaigns and data-driven strategies.", isHot: true },
  { id: "mkt-2", title: "SEO Specialist", department: "Marketing", location: "Remote (US)", openPositions: 2, description: "Optimize organic search visibility and drive qualified traffic." },
  { id: "mkt-3", title: "Content Marketing Manager", department: "Marketing", location: "Austin, TX", openPositions: 2, description: "Create compelling travel content across multiple channels." },
  { id: "mkt-4", title: "Social Media Manager", department: "Marketing", location: "Remote (US)", openPositions: 2, description: "Manage brand presence across social platforms and communities." },
  { id: "mkt-5", title: "Performance Marketing Analyst", department: "Marketing", location: "Chicago, IL", openPositions: 3, description: "Optimize ad spend across Google, Meta, and programmatic channels." },
  { id: "mkt-6", title: "Email Marketing Specialist", department: "Marketing", location: "Remote (US)", openPositions: 2, description: "Design and execute high-converting email campaigns." },
  { id: "mkt-7", title: "Brand Partnerships Manager", department: "Marketing", location: "New York, NY", openPositions: 1, description: "Build strategic partnerships with airlines, hotels, and brands." },

  // Sales
  { id: "sales-1", title: "Travel Sales Consultant", department: "Sales", location: "Remote (US)", openPositions: 6, description: "Convert leads into bookings with personalized travel solutions.", isHot: true },
  { id: "sales-2", title: "Corporate Travel Account Manager", department: "Sales", location: "New York, NY", openPositions: 3, description: "Manage B2B travel accounts and corporate partnerships." },
  { id: "sales-3", title: "Inside Sales Representative", department: "Sales", location: "Chicago, IL", openPositions: 5, description: "Generate and close inbound leads via phone and email." },
  { id: "sales-4", title: "Group Travel Specialist", department: "Sales", location: "Miami, FL", openPositions: 2, description: "Coordinate group bookings for corporate and leisure travel." },

  // Finance
  { id: "fin-1", title: "Financial Analyst", department: "Finance", location: "New York, NY", openPositions: 2, description: "Analyze revenue trends and support financial planning." },
  { id: "fin-2", title: "Accounts Payable Specialist", department: "Finance", location: "Austin, TX", openPositions: 2, description: "Manage vendor payments and reconciliation processes." },
  { id: "fin-3", title: "Revenue Accountant", department: "Finance", location: "Remote (US)", openPositions: 1, description: "Handle revenue recognition and month-end close processes." },

  // Legal
  { id: "legal-1", title: "Legal Counsel", department: "Legal & Compliance", location: "New York, NY", openPositions: 1, description: "Provide legal guidance for expanding operations and partnerships." },
  { id: "legal-2", title: "Compliance Analyst", department: "Legal & Compliance", location: "Remote (US)", openPositions: 2, description: "Ensure regulatory compliance across travel industry standards." },

  // HR
  { id: "hr-1", title: "HR Business Partner", department: "Human Resources", location: "Austin, TX", openPositions: 2, description: "Shape culture and build a world-class team of travel enthusiasts." },
  { id: "hr-2", title: "Talent Acquisition Specialist", department: "Human Resources", location: "Remote (US)", openPositions: 3, description: "Source and recruit top talent across all departments.", isHot: true },
  { id: "hr-3", title: "People Operations Coordinator", department: "Human Resources", location: "New York, NY", openPositions: 1, description: "Manage onboarding, benefits, and employee engagement programs." },

  // Product
  { id: "prod-1", title: "Product Manager", department: "Product", location: "San Francisco, CA", openPositions: 2, description: "Define product roadmap for booking and travel experience features." },
  { id: "prod-2", title: "Associate Product Manager", department: "Product", location: "Remote (US)", openPositions: 2, description: "Support product development with research and feature specs." },
  { id: "prod-3", title: "Product Analyst", department: "Product", location: "Austin, TX", openPositions: 2, description: "Drive product decisions with data analysis and user insights." },

  // Design
  { id: "des-1", title: "UI/UX Designer", department: "Design", location: "Remote (US)", openPositions: 2, description: "Design intuitive interfaces for millions of travel users." },
  { id: "des-2", title: "Visual Designer", department: "Design", location: "San Francisco, CA", openPositions: 1, description: "Create stunning visuals for marketing and product experiences." },
  { id: "des-3", title: "UX Researcher", department: "Design", location: "Austin, TX", openPositions: 1, description: "Conduct user research to inform product design decisions." },
];
