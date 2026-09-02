import { Internship } from "../models/Internship.js";
import { Service } from "../models/Service.js";

const defaultInternships = [
  {
    title: "Web Development",
    slug: "web-development",
    shortDescription: "Learn HTML/CSS, React, Node.js and build real-world web applications.",
    description:
      "A structured internship track covering frontend and backend fundamentals, modern React patterns, and deployment-ready project work.",
    role: "Web Developer",
    mode: "remote",
    skillsRequired: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    isPublished: true,
    durations: [
      {
        key: "4-weeks",
        label: "4 weeks",
        isPaid: true,
        price: 49,
        benefits: ["Workspace Access", "3 Real-world Projects", "Verifiable Certificate", "Weekly Q&A"],
        rewards: ["Performance Recognition"],
        description: "Introductory developer track",
        mentorship: "Weekly group Q&A",
        schedule: "Self-paced",
        projects: ["3 Practice projects"],
        tasks: ["Weekly submissions"],
        certificate: "Digital Certificate",
        swag: "Digital Certificate only",
        eligibility: "Open to all students"
      },
      {
        key: "3-months",
        label: "3 months",
        isPaid: true,
        price: 2499,
        benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Stipend Reward", "Navyan Swag Box"],
        rewards: ["Top 3 Performers: ₹5,000"],
        description: "Deep-dive professional developer track",
        mentorship: "1-on-1 Project reviews",
        schedule: "Weekend Live Classes",
        projects: ["3 Portfolio projects"],
        tasks: ["Advanced task sets"],
        certificate: "Premium Certificate",
        swag: "Navyan Swag Box (T-shirt, Sticker)",
        eligibility: "Basic coding knowledge"
      },
      {
        key: "6-months",
        label: "6 months",
        isPaid: true,
        price: 4499,
        benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Dedicated Mentor", "Elite Swag Hoodie Box"],
        rewards: ["Top Performer: ₹8,000"],
        description: "Production grade enterprise developer track",
        mentorship: "Dedicated Slack Coach & reviews",
        schedule: "Weekend Live Classes & Roadmaps",
        projects: ["3 Production capstone projects"],
        tasks: ["Enterprise architecture tasks"],
        certificate: "Elite Certificate",
        swag: "Navyan Elite Swag (Hoodie, T-Shirt, Swag Kit)",
        eligibility: "Intermediate programming skills"
      }
    ]
  },
  {
    title: "Data Science",
    slug: "data-science",
    shortDescription: "Learn Python, Pandas, and Machine Learning with hands-on analytics projects.",
    description:
      "Build data analysis, visualization, and machine learning skills through guided projects and mentor feedback.",
    role: "Data Scientist",
    mode: "remote",
    skillsRequired: ["Python", "Pandas", "Statistics", "Machine Learning"],
    isPublished: true,
    durations: [
      {
        key: "4-weeks",
        label: "4 weeks",
        isPaid: true,
        price: 49,
        benefits: ["Workspace Access", "3 Real-world Projects", "Verifiable Certificate", "Weekly Q&A"],
        rewards: ["Performance Recognition"],
        description: "Introductory data track",
        mentorship: "Weekly group Q&A",
        schedule: "Self-paced",
        projects: ["3 Practice projects"],
        tasks: ["Weekly submissions"],
        certificate: "Digital Certificate",
        swag: "Digital Certificate only",
        eligibility: "Open to all students"
      },
      {
        key: "3-months",
        label: "3 months",
        isPaid: true,
        price: 2499,
        benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Stipend Reward", "Navyan Swag Box"],
        rewards: ["Top 3 Performers: ₹5,000"],
        description: "Deep-dive professional data track",
        mentorship: "1-on-1 Project reviews",
        schedule: "Weekend Live Classes",
        projects: ["3 Data science projects"],
        tasks: ["Advanced task sets"],
        certificate: "Premium Certificate",
        swag: "Navyan Swag Box (T-shirt, Sticker)",
        eligibility: "Basic math & python"
      },
      {
        key: "6-months",
        label: "6 months",
        isPaid: true,
        price: 4499,
        benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Dedicated Mentor", "Elite Swag Hoodie Box"],
        rewards: ["Top Performer: ₹8,000"],
        description: "Production grade enterprise data track",
        mentorship: "Dedicated Slack Coach & reviews",
        schedule: "Weekend Live Classes & Roadmaps",
        projects: ["3 Production machine learning projects"],
        tasks: ["Enterprise architecture tasks"],
        certificate: "Elite Certificate",
        swag: "Navyan Elite Swag (Hoodie, T-Shirt, Swag Kit)",
        eligibility: "Intermediate math & data science skills"
      }
    ]
  },
  {
    title: "UI/UX Design",
    slug: "ui-ux-design",
    shortDescription: "Learn Figma, user research, wireframing, and product design workflows.",
    description:
      "Practice user-centered design through research, prototyping, and polished case-study delivery.",
    role: "UI/UX Designer",
    mode: "remote",
    skillsRequired: ["Figma", "User Research", "Wireframing", "Prototyping"],
    isPublished: true,
    durations: [
      {
        key: "4-weeks",
        label: "4 weeks",
        isPaid: true,
        price: 49,
        benefits: ["Workspace Access", "3 Real-world Projects", "Verifiable Certificate", "Weekly Q&A"],
        rewards: ["Performance Recognition"],
        description: "Introductory UI/UX track",
        mentorship: "Weekly group Q&A",
        schedule: "Self-paced",
        projects: ["3 Practice projects"],
        tasks: ["Weekly submissions"],
        certificate: "Digital Certificate",
        swag: "Digital Certificate only",
        eligibility: "Open to all students"
      },
      {
        key: "3-months",
        label: "3 months",
        isPaid: true,
        price: 2499,
        benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Stipend Reward", "Navyan Swag Box"],
        rewards: ["Top 3 Performers: ₹5,000"],
        description: "Deep-dive professional UI/UX track",
        mentorship: "1-on-1 Project reviews",
        schedule: "Weekend Live Classes",
        projects: ["3 Case studies"],
        tasks: ["Advanced design tasks"],
        certificate: "Premium Certificate",
        swag: "Navyan Swag Box (T-shirt, Sticker)",
        eligibility: "Basic creative skills"
      },
      {
        key: "6-months",
        label: "6 months",
        isPaid: true,
        price: 4499,
        benefits: ["Workspace Access", "3 Real-world Projects", "Live Classes", "Dedicated Mentor", "Elite Swag Hoodie Box"],
        rewards: ["Top Performer: ₹8,000"],
        description: "Production grade enterprise UI/UX track",
        mentorship: "Dedicated Slack Coach & reviews",
        schedule: "Weekend Live Classes & Roadmaps",
        projects: ["3 Complete product designs"],
        tasks: ["Enterprise product design challenges"],
        certificate: "Elite Certificate",
        swag: "Navyan Elite Swag (Hoodie, T-Shirt, Swag Kit)",
        eligibility: "Intermediate UI/UX design skills"
      }
    ]
  }
];

const defaultServices = [
  {
    title: "Website Development",
    slug: "website-development",
    shortDescription: "Modern, responsive websites built for performance, SEO, and conversion.",
    description:
      "From landing pages to full business websites, we deliver clean UI, fast load times, and scalable architecture.",
    category: "Web",
    highlights: ["Responsive design", "SEO-ready structure", "CMS integration", "Performance optimization"]
  },
  {
    title: "Mobile App Development",
    slug: "mobile-app-development",
    shortDescription: "Cross-platform and native mobile apps with polished user experiences.",
    description:
      "We design and build mobile applications with reliable backend integration and production-ready release support.",
    category: "Mobile",
    highlights: ["Android & iOS", "API integration", "Push notifications", "App store deployment"]
  },
  {
    title: "Custom Software Solutions",
    slug: "custom-software-solutions",
    shortDescription: "Tailored software for dashboards, automation, and internal business tools.",
    description:
      "Custom platforms, admin panels, and workflow automation built around your exact business requirements.",
    category: "Software",
    highlights: ["Custom dashboards", "Role-based access", "Automation workflows", "Cloud deployment"]
  },
  {
    title: "UI/UX Design",
    slug: "ui-ux-design-services",
    shortDescription: "Product design systems, wireframes, and high-fidelity prototypes.",
    description:
      "Research-led design for web and mobile products, from discovery and wireframes to polished design handoff.",
    category: "Design",
    highlights: ["User research", "Wireframes", "Design systems", "Prototype handoff"]
  }
];

export const seedCatalogIfEmpty = async () => {
  const [internshipCount, serviceCount] = await Promise.all([
    Internship.countDocuments({ isDeleted: { $ne: true } }),
    Service.countDocuments({ isDeleted: { $ne: true } })
  ]);

  if (internshipCount === 0) {
    await Internship.insertMany(defaultInternships);
    console.log(`Seeded ${defaultInternships.length} default internships.`);
  }

  if (serviceCount === 0) {
    await Service.insertMany(defaultServices);
    console.log(`Seeded ${defaultServices.length} default services.`);
  }
};
