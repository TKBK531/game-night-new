// Rules and Regulations Configuration - Update this file to modify rules content
export const rulesAndRegulations = {
  title: "Game Night: Reignite - Rules and Regulations",
  lastUpdated: "July 25, 2025",

  // General Rules
  general: {
    title: "General Rules and Regulations",
    rules: [
      {
        id: "eligibility",
        title: "Eligibility",
        content: [
          "Participants must be current students of the University of Peradeniya or affiliated institutions",
          "Each player must provide valid student identification during registration",
          "Players must be at least 16 years old to participate",
          "International students are welcome to participate with proper documentation",
        ],
      },
      {
        id: "registration",
        title: "Registration Requirements",
        content: [
          "All team registrations must be completed before the deadline: July 14, 2025",
          "Registration fee must be paid in full (LKR 1,000 per team)",
          "Valid payment proof must be uploaded during registration",
          "Team rosters cannot be changed after registration confirmation",
          "Each player can only be registered for one team per tournament",
        ],
      },
      {
        id: "conduct",
        title: "Code of Conduct",
        content: [
          "All participants must maintain respectful and sportsmanlike behavior",
          "Use of inappropriate language, harassment, or toxic behavior will result in immediate disqualification",
          "Cheating, hacking, or exploitation of game bugs is strictly prohibited",
          "Players must respect tournament officials, organizers, and fellow competitors",
          "Any form of discrimination based on race, gender, religion, or nationality is forbidden",
        ],
      },
      {
        id: "equipment",
        title: "Equipment and Setup",
        content: [
          "Gaming PCs and peripherals will be provided by the organizers",
          "Players are allowed to bring their own keyboards, mice, and headsets",
          "All equipment must be approved by tournament officials before use",
          "Players are responsible for their personal equipment and belongings",
          "Technical issues must be reported immediately to tournament officials",
        ],
      },
    ],
  },

  // Tournament Specific Rules
  tournaments: {
    valorant: {
      title: "Valorant Tournament Rules",
      rules: [
        {
          id: "team-composition",
          title: "Team Composition",
          content: [
            "Each team must consist of exactly 5 players",
            "Teams must have at least 1 substitute player registered",
            "All team members must be present at the venue during their matches",
            "Substitutions are only allowed between matches, not during ongoing games",
          ],
        },
        {
          id: "match-format",
          title: "Match Format",
          content: [
            "Qualifier rounds: Best of 1 (BO1)",
            "Semi-finals: Best of 3 (BO3)",
            "Finals: Best of 5 (BO5)",
            "Map selection follows standard competitive rules",
            "Overtime rules apply as per official Valorant competitive settings",
          ],
        },
        {
          id: "game-settings",
          title: "Game Settings",
          content: [
            "Tournament mode with standard competitive settings",
            "All matches played on official Valorant servers",
            "Round time: 100 seconds, Buy time: 30 seconds",
            "First to 13 rounds wins (with overtime if tied 12-12)",
            "Spectator mode disabled during competitive matches",
          ],
        },
      ],
    },
    cod: {
      title: "Call of Duty Tournament Rules",
      rules: [
        {
          id: "team-composition-cod",
          title: "Team Composition",
          content: [
            "Each team must consist of exactly 5 players",
            "Teams must have at least 1 or 2 substitute player registered",
            "All team members must be present at the venue during their matches",
            "Substitutions are only allowed between matches, not during ongoing games",
          ],
        },
        {
          id: "match-format-cod",
          title: "Match Format",
          content: [
            "Qualifier rounds: Single elimination bracket",
            "Battle Royale format for elimination rounds",
            "Final circle determines match winners",
            "Custom lobby settings as determined by organizers",
            "Reconnection allowed only in case of technical issues",
          ],
        },
        {
          id: "game-settings-cod",
          title: "Game Settings",
          content: [
            "Call of Duty: Warzone standard competitive settings",
            "Custom lobby with tournament-specific configurations",
            "No third-party software or modifications allowed",
            "All communication must be through in-game voice chat or approved platforms",
            "Recording and streaming may be conducted by organizers",
          ],
        },
        {
          id: "gameplay-rules",
          title: "General Game Rules",
          content: [
            "The team to reach 13 rounds first wins the match.",
            "Bomb Timer: 45 seconds",
            "Defuse Time: 7 seconds",
            "Plant Time: 5 seconds",
            "Round Limit: 24 rounds, with half time and switching sides at 12",
            "Time Limit: 1 minute 45 seconds per round",
            "Score Limit: First team to 13 rounds wins",
            "All matches will be played on Promodlive2.20 EU (promod_mode lan_knockout_mr12).",
          ],
        },
        {
          id: "banned-weapons",
          title: "Banned Weapons, Attachments, and Grenades",
          content: [
            "Banned weapons: P90, Scorpion, M21, Dragunov, Barrett .50cal, LMGs",
            "All attachments are banned except for silencers",
            "Stun grenades are disabled",
            "All perks are disabled",
          ],
        },
        {
          id: "class-limits",
          title: "Class Restrictions",
          content: [
            "Maximum per team of 5:",
            "- One (1) Sniper",
            "- One (1) Demolition",
            "- Two (2) SMG",
            "- Five (5) Assault",
          ],
        },
        {
          id: "seeding",
          title: "Determining the Better Seed",
          content: [
            "Online: The team listed first on the match page/bracket is the higher seed",
            "LAN: A coin toss determines the better seed",
            "The lower seed will always start the veto process",
          ],
        },
        {
          id: "map-pool",
          title: "Map Pool",
          content: [
            "Official maps:",
            "- mp_backlot",
            "- mp_crash",
            "- mp_crossfire",
            "- mp_citystreet",
            "- mp_strike",
          ],
        },
        {
          id: "illegal-modifications",
          title: "Gameplay Restrictions",
          content: [
            "Modifying game files is strictly prohibited",
            "Use of third-party software to gain unfair advantage is banned",
            "Illegal bindings include:",
            "- Any bind of 3 or more keys",
            "- Binds that modify visuals like no fog/foliage",
            "- External script-based exec/vstr binds that give advantage",
            "- Scripts containing ‘lookdown’, ‘wait’",
            "- Combining 'attack', 'frag', or 'weapnext' with other commands",
            "- Binding ‘attack’ to MOUSE WHEEL UP/DOWN is prohibited",
          ],
        },
        {
          id: "permitted-bindings",
          title: "Permitted Bindings",
          content: [
            "Stock single-key gameplay binds",
            "Max 2 motion keys in a bind (e.g., +leanright;+moveright)",
            "Namebinds, demoscripts, weapon/menu/select scripts, volume binds/toggles",
            "For unusual bindings, seek admin approval",
          ],
        },
        {
          id: "in-game-names",
          title: "In-Game Name Policy",
          content: [
            "Players must use their main nickname or a recognizable variant",
            "Clan/sponsor tags are allowed",
            "No offensive/profane in-game names",
          ],
        },
      ],
    },
  },

  // Penalties and Disqualifications
  penalties: {
    title: "Penalties and Disqualifications",
    rules: [
      {
        id: "violations",
        title: "Rule Violations",
        content: [
          "Minor violations may result in warnings or round penalties",
          "Major violations will result in match forfeiture or tournament disqualification",
          "Repeated violations will lead to permanent ban from future events",
          "All decisions by tournament officials are final and binding",
        ],
      },
      {
        id: "cheating",
        title: "Cheating and Misconduct",
        content: [
          "Use of any unauthorized software, hacks, or exploits results in immediate disqualification",
          "Collusion or match-fixing leads to permanent ban from all events",
          "Sharing of strategies or information with opposing teams is prohibited",
          "All suspected cheating incidents will be thoroughly investigated",
        ],
      },
      {
        id: "technical-issues",
        title: "Technical Issues",
        content: [
          "Players must report technical issues immediately to officials",
          "Matches may be paused or restarted at the discretion of tournament officials",
          "Excessive technical issues may result in team forfeiture",
          "Equipment failure is the responsibility of the affected team",
        ],
      },
    ],
  },

  // Event Policies
  policies: {
    title: "Event Policies",
    rules: [
      {
        id: "venue-rules",
        title: "Venue Rules",
        content: [
          "All participants must follow university campus regulations",
          "Smoking and alcohol consumption are strictly prohibited",
          "Food and drinks are allowed only in designated areas",
          "Participants must keep the venue clean and organized",
          "Emergency evacuation procedures must be followed if announced",
        ],
      },
      {
        id: "media-rights",
        title: "Media and Broadcasting",
        content: [
          "The event may be recorded, photographed, or live-streamed",
          "Participants consent to use of their likeness for promotional purposes",
          "Personal streaming or recording by participants requires prior approval",
          "Social media posting about the event is encouraged but must be respectful",
        ],
      },
      {
        id: "prizes",
        title: "Prize Distribution",
        content: [
          "Prizes will be distributed immediately after the closing ceremony",
          "Winners must be present to claim their prizes",
          "Prize distribution is subject to verification of participant eligibility",
          "Taxes on prizes, if applicable, are the responsibility of the winners",
          "Prizes cannot be transferred to other individuals",
        ],
      },
    ],
  },

  // Legal and Liability
  legal: {
    title: "Legal and Liability",
    rules: [
      {
        id: "liability",
        title: "Liability Waiver",
        content: [
          "Participants compete at their own risk",
          "Organizers are not liable for personal injury or property damage",
          "Participants are responsible for their personal belongings",
          "Medical emergencies will be handled according to university protocols",
          "Insurance coverage is the responsibility of individual participants",
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual Property",
        content: [
          "All game content and trademarks belong to their respective owners",
          "Event branding and materials are property of the organizing committee",
          "Participants retain rights to their own team names and logos",
          "Commercial use of event materials requires written permission",
        ],
      },
      {
        id: "modifications",
        title: "Rule Modifications",
        content: [
          "Rules may be updated or modified at the discretion of organizers",
          "Participants will be notified of any significant rule changes",
          "Emergency rule changes may be implemented during the event if necessary",
          "All participants are expected to stay informed about rule updates",
        ],
      },
    ],
  },

  // Contact and Appeals
  contact: {
    title: "Contact and Appeals",
    rules: [
      {
        id: "appeals-process",
        title: "Appeals Process",
        content: [
          "Appeals must be submitted within 30 minutes of the disputed decision",
          "Appeals must be submitted in writing to tournament officials",
          "A panel of officials will review all appeals fairly and promptly",
          "The decision of the appeals panel is final and cannot be further contested",
          "Frivolous or repeated appeals may result in penalties",
        ],
      },
      {
        id: "contact-info",
        title: "Contact Information",
        content: [
          "Tournament Director: Available on-site during the event",
          "Technical Support: Available at the help desk",
          "Medical Emergency: Contact university security or call emergency services",
          "General Inquiries: info@gamezoneevents.com",
          "Appeals Committee: Available 30 minutes before and after each match",
        ],
      },
    ],
  },

  // Acknowledgment
  acknowledgment: {
    title: "Participant Acknowledgment",
    content: [
      "By registering for this tournament, I acknowledge that I have read and understood all rules and regulations",
      "I agree to comply with all tournament rules, venue policies, and code of conduct requirements",
      "I understand that violation of these rules may result in penalties up to and including disqualification",
      "I consent to the recording and use of my likeness for promotional purposes related to this event",
      "I participate in this tournament at my own risk and release organizers from liability for injuries or damages",
      "I understand that all decisions by tournament officials are final and binding",
    ],
  },
};
