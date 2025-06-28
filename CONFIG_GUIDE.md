# Website Configuration Guide

This project uses a centralized configuration system that makes it easy to update all website content by editing a single file.

## Configuration File Location

The main configuration file is located at:
```
shared/config.ts
```

## How to Update Website Content

To change any content on the website (dates, venue, times, prizes, etc.), simply edit the `shared/config.ts` file. All components will automatically use the updated values.

### Key Configuration Sections

#### 1. Event Information
```typescript
event: {
  name: "Game Night",                // Main event name (shows in header/footer)
  title: "Reignite",                 // Event title/subtitle  
  subtitle: "Join the most epic gaming tournament of the year!",
  description: "Experience the thrill of competitive gaming...",
  year: "2025"                       // Event year
}
```

#### 2. Schedule & Dates
```typescript
schedule: {
  registrationStart: "2025-01-01",   // When registration opens
  registrationEnd: "2025-01-31",     // When registration closes  
  eventDate: "2025-02-15",           // Main event date (YYYY-MM-DD)
  eventDateFormatted: "Saturday, February 15, 2025", // Human readable format
  eventDayName: "Game Day",          // Name for the event day
  eventStartTime: "09:00 AM",        // Event start time
  eventEndTime: "11:00 PM",          // Event end time
  timezone: "IST"                    // Timezone
}
```

#### 3. Venue Information
```typescript
venue: {
  name: "Gaming Arena",              // Venue name
  address: "123 Gaming Street, Tech City", // Full address
  city: "Bangalore",
  state: "Karnataka", 
  country: "India",
  pincode: "560001",
  coordinates: {                     // For maps integration
    latitude: "12.9716",
    longitude: "77.5946"
  }
}
```

#### 4. Contact Details
```typescript
contact: {
  email: "info@gamezoneevents.com",  // Contact email
  phone: "+91 9876543210",           // Phone number
  whatsapp: "+91 9876543210",        // WhatsApp number
  website: "https://gamezoneevents.com",
  socialMedia: {
    instagram: "@gamezoneevents",
    twitter: "@gamezoneevents",
    discord: "GameZone#1234"
  }
}
```

#### 5. Tournament Configuration
```typescript
tournaments: {
  valorant: {
    name: "Valorant Championship",    // Tournament name
    prizePool: "LKR 50,000",         // Prize amount in Sri Lankan Rupees
    maxTeams: 32,                    // Maximum teams allowed
    teamSize: 5,                     // Players per team
    registrationFee: "LKR 500",      // Registration fee in LKR
    rules: [                         // Tournament rules
      "Each team must have exactly 5 players",
      "All players must be present during the tournament",
      // ... more rules
    ]
  },
  cod: {
    // Similar structure for COD tournament
  }
}
```

#### 6. Payment Information
```typescript
payment: {
  accountName: "GameZone Events",     // Bank account name
  accountNumber: "1234567890",       // Account number
  ifscCode: "BANK0001234",           // IFSC code
  bankName: "State Bank of India",   // Bank name
  branchName: "Tech City Branch",    // Branch name
  upiId: "gamezone@paytm",           // UPI ID
  instructions: [                    // Payment instructions
    "Pay the registration fee to complete your team registration",
    // ... more instructions
  ]
}
```

#### 7. Event Timeline
```typescript
timeline: [
  {
    time: "09:00 AM",                // Event time
    event: "Registration & Check-in", // Event name
    description: "Team verification and final preparations" // Description
  },
  // ... more timeline events
]
```

#### 8. Hero Section Stats Cards
```typescript
heroStats: [
  {
    icon: "Gamepad2",                // Icon name (Gamepad2, Shield, Cpu)
    value: "dynamic",                // "dynamic" for calculated values
    label: "Total Prize Pool",       // Label shown below the value
    color: "#ff4654",                // Color for icon and value
    animationDelay: "0.6s"           // CSS animation delay
  },
  {
    icon: "Shield", 
    value: "dynamic",                // Calculated from tournament max teams
    label: "Elite Competitors",
    color: "#ffffff",
    animationDelay: "0.7s"
  },
  {
    icon: "Cpu",
    value: "dynamic",                // Shows event start-end time
    label: "Event Duration", 
    color: "#ba3a46",
    animationDelay: "0.8s"
  }
]
```

## Rules and Regulations System

The project includes a comprehensive rules and regulations system with centralized data management:

### Rules Data File
- **Location**: `shared/rules.ts`
- **Contains**: All tournament rules, policies, and regulations
- **Sections**: General rules, tournament-specific rules, penalties, policies, legal terms, and contact information

### Components
1. **Rules Popup** (`components/rules-popup.tsx`): Shows during registration
2. **Rules Page** (`pages/rules.tsx`): Full standalone rules page
3. **Integration**: Built into team registration process

### Features
- **Mandatory Acceptance**: Users must read and accept rules before registering
- **Scroll Validation**: Users must scroll through the entire popup
- **Centralized Data**: All rules content managed in one file
- **Responsive Design**: Works on all device sizes
- **Print Functionality**: Rules page can be printed

### Updating Rules
To modify rules and regulations:
1. Edit `shared/rules.ts`
2. Update the `lastUpdated` field
3. Modify content in any section (general, tournaments, penalties, etc.)
4. Rules will automatically appear in both popup and full page

## Making Changes

1. **Edit the config file**: Open `shared/config.ts` in any text editor
2. **Update values**: Change any values you need (dates, venue, prizes, etc.)
3. **Save the file**: The website will automatically use the new values
4. **Rebuild if needed**: Run `npm run build` to rebuild the project for deployment

## Examples of Common Changes

### Change Event Date
```typescript
schedule: {
  eventDate: "2025-03-20",  // Change to new date
  // ... other fields
}
```

### Update Prize Pool
```typescript
tournaments: {
  valorant: {
    prizePool: "LKR 75,000",   // Increase prize amount in LKR
    // ... other fields
  }
}
```

### Change Venue
```typescript
venue: {
  name: "New Gaming Arena",
  address: "456 New Street, Gaming City",
  city: "Delhi",
  // ... other fields
}
```

### Update Contact Info
```typescript
contact: {
  email: "newcontact@gamezone.com",
  phone: "+91 9999888877",
  // ... other fields
}
```

### Change Event Title
```typescript
event: {
  name: "Game Night",
  title: "Championship 2025",  // Change main title
  // ... other fields
}
```

### Update Event Day Details
```typescript
schedule: {
  eventDateFormatted: "Sunday, March 20, 2025", // Change display date
  eventDayName: "Championship Day",              // Change day name
  // ... other fields
}
```

### Customize Hero Stats Cards
```typescript
heroStats: [
  {
    icon: "Gamepad2",
    label: "Total Rewards",    // Change label text
    color: "#00ff00",         // Change color
    // ... other fields
  }
  // ... other cards
]
```

## Notes

- Always keep the structure intact - only change the values, not the property names
- Dates should be in YYYY-MM-DD format for consistency
- Times should include AM/PM for clarity
- Prize amounts should include currency designation (LKR)
- Keep backup of original config before making major changes
- Test the website after making changes to ensure everything works correctly

## Deployment

After making changes to the config file:

1. Commit your changes to git
2. Push to your repository
3. Deploy to Vercel (will automatically rebuild with new config)

The configuration system ensures that all parts of the website stay synchronized and up-to-date with your changes.
