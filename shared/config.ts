// Website Configuration - Update this file to modify content
export const siteConfig = {
  // Event Information
  event: {
    name: "Game Night",
    title: "REIGNITE",
    subtitle: "Join the most epic gaming tournament of the year!",
    description:
      "Experience the thrill of competitive gaming with top prizes and unforgettable moments",
    year: "'25",
  },

  // Event Schedule & Dates
  schedule: {
    registrationStart: "2025-07-05",
    registrationEnd: "2025-07-14",
    eventDate: "2025-07-18",
    eventDateFormatted: "Friday, July 18, 2025", // Human readable format
    eventDayName: "Game Night", // Name for the event day
    eventStartTime: "04:00 PM",
    eventEndTime: "11:30 PM",
    timezone: "IST",
    registrationOpen: false, // Set to false to close registration
  },

  // Venue Information
  venue: {
    name: "Lab 4",
    address: "Lab 4",
    city: "Department of Statistics & Computer Science",
    state: "University of Peradeniya",
    country: "",
    pincode: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
  },

  // Contact Information
  contact: {
    email: "president.csup@soc.pdn.ac.lk",
    phone: "+94 763853141",
    whatsapp: "+94 763853141",
    website: "https://gamenight.csup.site/",
    socialMedia: {
      instagram: "@gamezoneevents",
      twitter: "@gamezoneevents",
      discord: "GameZone#1234",
    },
  },

  // Tournament Configuration
  tournaments: {
    valorant: {
      name: "Valorant Championship",
      prizePool: "LKR 30,000",
      maxTeams: 8,
      teamSize: 5,
      registrationFee: "LKR 1000",
      rules: [
        "Each team must have exactly 5 players",
        "All players must be present during the tournament",
        "No substitutions allowed during matches",
        "Standard Valorant competitive rules apply",
      ],
    },
    cod: {
      name: "Call of Duty",
      prizePool: "LKR 30,000",
      maxTeams: 12,
      teamSize: 5,
      registrationFee: "LKR 1000",
      rules: [
        "Each team must have exactly 5 players",
        "All players must be present during the tournament",
        "No substitutions allowed during matches",
        "Standard COD Warzone rules apply",
      ],
    },
  },

  // Payment Information
  payment: {
    accountName: "Vidusha Sanidu",
    accountNumber: "049200370189421",
    ifscCode: "BANK0001234",
    bankName: "Peoples Bank",
    branchName: "Homagama",
    upiId: "gamezone@paytm",
    instructions: [
      "Pay the registration fee to complete your team registration",
      "Upload payment proof (screenshot/receipt) during registration",
      "Registration is confirmed only after payment verification",
      "Refunds are not available after registration confirmation",
    ],
  },

  // Website Settings
  ui: {
    theme: {
      primaryColor: "#ff4654",
      secondaryColor: "#ba3a46",
      accentColor: "#00ffff",
      backgroundColor: "#0a0a0a",
    },
    animations: {
      enableAnimations: true,
      animationSpeed: "normal", // "slow", "normal", "fast"
    },
  },

  // Features & Games
  features: {
    reactionGame: {
      enabled: true,
      title: "Reaction Speed Challenge",
      description:
        "Test your reflexes and compete for the fastest reaction time!",
      leaderboardLimit: 10,
    },
    teamRegistration: {
      enabled: true,
      requireBankSlip: true,
      maxFileSize: "5MB",
      allowedFileTypes: ["image/*", ".pdf"],
    },
  },

  // Hero Section Stats Cards
  heroStats: [
    {
      icon: "Gamepad2",
      value: "dynamic", // Will be calculated from tournament prize pools
      label: "Total Prize Pool",
      color: "#ff4654",
      animationDelay: "0.6s",
    },
    {
      icon: "Shield",
      value: "dynamic", // Will be calculated from tournament max teams
      label: "Elite Competitors",
      color: "#ffffff",
      animationDelay: "0.7s",
    },
    {
      icon: "Cpu",
      value: "dynamic", // Will show event start-end time
      label: "Event Duration",
      color: "#ba3a46",
      animationDelay: "0.8s",
    },
  ],

  // Event Timeline
  timeline: [
  {
    time: "04:00 PM",
    event: "Registration & Check-in",
    description: "Team verification and final preparations",
  },
  {
    time: "04:30 PM",
    event: "Opening Ceremony",
    description: "Welcome address and tournament briefing",
  },
  {
    time: "05:00 PM",
    event: "Qualifier Rounds Begin",
    description: "Initial elimination rounds for Valorant and COD",
  },
  {
    time: "06:30 PM",
    event: "Quarter-Finals",
    description: "Top teams face off in Valorant and COD",
  },
  {
    time: "07:45 PM",
    event: "Dinner Break",
    description: "Food and networking session",
  },
  {
    time: "08:15 PM",
    event: "Semi-Finals",
    description: "Winners from quarters compete in semi-final matches",
  },
  {
    time: "09:30 PM",
    event: "Finals",
    description: "Valorant and COD finals — the ultimate showdown",
  },
  {
    time: "11:00 PM",
    event: "Prize Distribution",
    description: "Awards ceremony and closing",
  },
],
};
