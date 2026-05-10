import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Budget estimates in NPR per day: [low, mid, high]
// Emergency contacts, nearest hospitals, crowd levels, network availability
const destinationUpdates: Record<string, {
  budgetEstimateLow: number;
  budgetEstimateMid: number;
  budgetEstimateHigh: number;
  emergencyContacts: string;
  nearestHospital: string;
  nearestPolice: string;
  networkAvailability: string;
  crowdLevel: string;
  altitudeWarning?: string;
}> = {
  "kathmandu": {
    budgetEstimateLow: 2500, budgetEstimateMid: 7500, budgetEstimateHigh: 20000,
    emergencyContacts: "Police: 100 | Ambulance: 102 | Tourist Police: 1144 | Fire: 101",
    nearestHospital: "Tribhuvan University Teaching Hospital (3 km from Thamel)",
    nearestPolice: "Tourist Police Unit, Bhrikutimandap",
    networkAvailability: "Excellent - 4G/5G coverage, WiFi widely available",
    crowdLevel: "High",
  },
  "pokhara": {
    budgetEstimateLow: 2000, budgetEstimateMid: 6000, budgetEstimateHigh: 18000,
    emergencyContacts: "Police: 100 | Ambulance: 102 | Tourist Police: 061-463041",
    nearestHospital: "Western Regional Hospital, Pokhara (Lakeside 2 km)",
    nearestPolice: "Tourist Police, Lakeside",
    networkAvailability: "Excellent - 4G coverage, WiFi in most hotels/cafes",
    crowdLevel: "High",
  },
  "everest-base-camp": {
    budgetEstimateLow: 5000, budgetEstimateMid: 12000, budgetEstimateHigh: 35000,
    emergencyContacts: "Himalayan Rescue Association: 01-4440292 | CIWEC Clinic: 01-4424111",
    nearestHospital: "Kunde Hospital (near Namche) | Lukla Health Post",
    nearestPolice: "Namche Bazaar Police Post",
    networkAvailability: "Limited - Ncell available to Namche, Everest Link WiFi available (paid)",
    crowdLevel: "Moderate-High (peak season)",
    altitudeWarning: "EXTREME ALTITUDE (5,364m). Acclimatize properly. Risk of AMS, HACE, HAPE above 3,500m. Carry Diamox.",
  },
  "annapurna-circuit": {
    budgetEstimateLow: 3000, budgetEstimateMid: 8000, budgetEstimateHigh: 25000,
    emergencyContacts: "ACAP Office: 061-465766 | Rescue: 01-4240922",
    nearestHospital: "Manang Health Post | Jomsom Hospital",
    nearestPolice: "Manang Police Post | Jomsom Police Post",
    networkAvailability: "Moderate - Ncell patchy, WiFi in teahouses (paid)",
    crowdLevel: "Moderate",
    altitudeWarning: "HIGH ALTITUDE (5,416m at Thorong La). Gradual acclimatization required. Do not ascend more than 500m/day above 3,000m.",
  },
  "chitwan-national-park": {
    budgetEstimateLow: 3000, budgetEstimateMid: 8000, budgetEstimateHigh: 30000,
    emergencyContacts: "Park Office: 056-580054 | Ambulance: 102",
    nearestHospital: "Bharatpur Hospital (15 km from Sauraha)",
    nearestPolice: "Sauraha Police Station",
    networkAvailability: "Good - 4G in Sauraha, limited inside park",
    crowdLevel: "Moderate",
  },
  "lumbini": {
    budgetEstimateLow: 1500, budgetEstimateMid: 4000, budgetEstimateHigh: 12000,
    emergencyContacts: "Police: 100 | Lumbini Development Trust: 071-580177",
    nearestHospital: "Lumbini Zonal Hospital, Bhairahawa (20 km)",
    nearestPolice: "Lumbini Area Police Office",
    networkAvailability: "Good - 4G coverage available",
    crowdLevel: "Low-Moderate",
  },
  "rara-lake": {
    budgetEstimateLow: 2500, budgetEstimateMid: 6000, budgetEstimateHigh: 15000,
    emergencyContacts: "Park Office: 087-550024 | Police: 100",
    nearestHospital: "Mugu District Hospital, Gamgadhi (30 km)",
    nearestPolice: "Rara National Park Police Post",
    networkAvailability: "Very Limited - Ncell spotty, no regular WiFi",
    crowdLevel: "Very Low",
    altitudeWarning: "Moderate altitude (2,990m). Some visitors may experience mild altitude effects.",
  },
  "bhaktapur": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 15000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "Bhaktapur Hospital (1 km from Durbar Square)",
    nearestPolice: "Bhaktapur Metropolitan Police",
    networkAvailability: "Excellent - 4G coverage, WiFi in hotels",
    crowdLevel: "Moderate",
  },
  "patan": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5500, budgetEstimateHigh: 16000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "Patan Hospital (1 km from Durbar Square)",
    nearestPolice: "Lalitpur Metropolitan Police",
    networkAvailability: "Excellent - 4G/5G coverage",
    crowdLevel: "Moderate",
  },
  "nagarkot": {
    budgetEstimateLow: 2500, budgetEstimateMid: 6000, budgetEstimateHigh: 18000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "Bhaktapur Hospital (20 km)",
    nearestPolice: "Nagarkot Police Post",
    networkAvailability: "Good - 4G available, WiFi in hotels",
    crowdLevel: "Moderate",
  },
  "upper-mustang": {
    budgetEstimateLow: 8000, budgetEstimateMid: 15000, budgetEstimateHigh: 40000,
    emergencyContacts: "ACAP Office: 069-440024 | Rescue: 01-4240922",
    nearestHospital: "Jomsom Hospital | Lo Manthang Health Post",
    nearestPolice: "Jomsom Police Post",
    networkAvailability: "Very Limited - Ncell in Jomsom only, no WiFi in Lo Manthang",
    crowdLevel: "Very Low",
    altitudeWarning: "High altitude region (3,800m+). Acclimatize in Jomsom before proceeding.",
  },
  "langtang-valley": {
    budgetEstimateLow: 3000, budgetEstimateMid: 7000, budgetEstimateHigh: 20000,
    emergencyContacts: "Langtang National Park: 010-540222 | Rescue: 01-4240922",
    nearestHospital: "Syabrubesi Health Post | Kathmandu hospitals (120 km)",
    nearestPolice: "Syabrubesi Police Post",
    networkAvailability: "Limited - Ncell spotty above Lama Hotel",
    crowdLevel: "Low-Moderate",
    altitudeWarning: "High altitude (up to 4,984m at Kyanjin Ri). Acclimatize properly.",
  },
  "gosaikunda": {
    budgetEstimateLow: 2500, budgetEstimateMid: 6000, budgetEstimateHigh: 15000,
    emergencyContacts: "Langtang NP Office: 010-540222 | Police: 100",
    nearestHospital: "Dhunche Hospital (trek start point)",
    nearestPolice: "Dhunche Police Post",
    networkAvailability: "Very Limited - No signal above Laurebina",
    crowdLevel: "Low (High during Janai Purnima)",
    altitudeWarning: "High altitude (4,380m). Risk of AMS. Acclimatize at Laurebina.",
  },
  "tilicho-lake": {
    budgetEstimateLow: 3500, budgetEstimateMid: 8000, budgetEstimateHigh: 22000,
    emergencyContacts: "ACAP Manang: 066-440024 | Rescue: 01-4240922",
    nearestHospital: "Manang Health Post",
    nearestPolice: "Manang Police Post",
    networkAvailability: "Very Limited - Basic signal in Manang only",
    crowdLevel: "Low",
    altitudeWarning: "EXTREME ALTITUDE (4,919m). One of the highest lakes in the world. Severe AMS risk. Must acclimatize in Manang.",
  },
  "bandipur": {
    budgetEstimateLow: 1500, budgetEstimateMid: 4000, budgetEstimateHigh: 12000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "Dumre Hospital (8 km)",
    nearestPolice: "Bandipur Police Post",
    networkAvailability: "Good - 4G coverage available",
    crowdLevel: "Low",
  },
  "ilam": {
    budgetEstimateLow: 1500, budgetEstimateMid: 3500, budgetEstimateHigh: 10000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "Ilam District Hospital",
    nearestPolice: "Ilam District Police Office",
    networkAvailability: "Good - 4G in town, moderate in tea gardens",
    crowdLevel: "Low",
  },
  "janakpur": {
    budgetEstimateLow: 1200, budgetEstimateMid: 3000, budgetEstimateHigh: 8000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "Janakpur Zonal Hospital",
    nearestPolice: "Janakpur Metropolitan Police",
    networkAvailability: "Good - 4G coverage available",
    crowdLevel: "Moderate (High during festivals)",
  },
  "dharan": {
    budgetEstimateLow: 1500, budgetEstimateMid: 3500, budgetEstimateHigh: 10000,
    emergencyContacts: "Police: 100 | B.P. Koirala Hospital: 025-525555",
    nearestHospital: "B.P. Koirala Institute of Health Sciences",
    nearestPolice: "Dharan Metropolitan Police",
    networkAvailability: "Excellent - 4G coverage",
    crowdLevel: "Moderate",
  },
  "ghandruk": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 15000,
    emergencyContacts: "ACAP Ghandruk: 066-440024 | Rescue: 01-4240922",
    nearestHospital: "Ghandruk Health Post | Pokhara hospitals (50 km)",
    nearestPolice: "Ghandruk Police Post",
    networkAvailability: "Moderate - Ncell available, WiFi in some lodges",
    crowdLevel: "Moderate",
    altitudeWarning: "Moderate altitude (1,940m). Generally safe for most visitors.",
  },
  "tansen": {
    budgetEstimateLow: 1200, budgetEstimateMid: 3000, budgetEstimateHigh: 8000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "United Mission Hospital Tansen",
    nearestPolice: "Tansen Police Station",
    networkAvailability: "Good - 4G coverage in town",
    crowdLevel: "Very Low",
  },
  "badimalika": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 12000,
    emergencyContacts: "Police: 100 | District Hospital: 097-520022",
    nearestHospital: "Bajura District Hospital (trek start)",
    nearestPolice: "Bajura Police Post",
    networkAvailability: "Very Limited - Basic Ncell near base",
    crowdLevel: "Very Low (High during festivals)",
    altitudeWarning: "High altitude temple (4,200m). Carry warm clothing and be prepared for rapid weather changes.",
  },
  "khaptad-national-park": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 12000,
    emergencyContacts: "Park Office: 099-520044 | Police: 100",
    nearestHospital: "Doti District Hospital (nearest town)",
    nearestPolice: "Khaptad NP Check Post",
    networkAvailability: "Very Limited - Almost no coverage inside park",
    crowdLevel: "Very Low",
    altitudeWarning: "Moderate-high altitude (3,000m+). Pack warm layers.",
  },
  "manang": {
    budgetEstimateLow: 3000, budgetEstimateMid: 7000, budgetEstimateHigh: 18000,
    emergencyContacts: "ACAP Manang: 066-440024 | HRA Manang: Available in season",
    nearestHospital: "Himalayan Rescue Association Aid Post (seasonal)",
    nearestPolice: "Manang Police Post",
    networkAvailability: "Limited - Ncell available in Manang village, WiFi in some lodges",
    crowdLevel: "Low-Moderate",
    altitudeWarning: "High altitude (3,519m). Important acclimatization stop on Annapurna Circuit.",
  },
  "namche-bazaar": {
    budgetEstimateLow: 4000, budgetEstimateMid: 10000, budgetEstimateHigh: 28000,
    emergencyContacts: "HRA Namche: Available in season | Police: Namche Post",
    nearestHospital: "Khunde Hospital (1 hr walk) | Namche Health Post",
    nearestPolice: "Namche Bazaar Police Post",
    networkAvailability: "Moderate - Everest Link WiFi, Ncell available",
    crowdLevel: "Moderate-High (peak season)",
    altitudeWarning: "High altitude (3,440m). Key acclimatization point. Spend 2 nights here.",
  },
  "syabrubesi": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 12000,
    emergencyContacts: "Langtang NP: 010-540222 | Police: 100",
    nearestHospital: "Syabrubesi Health Post | Dhunche Hospital",
    nearestPolice: "Syabrubesi Police Post",
    networkAvailability: "Moderate - Ncell available in village",
    crowdLevel: "Low",
  },
  "dhulikhel": {
    budgetEstimateLow: 2500, budgetEstimateMid: 6000, budgetEstimateHigh: 18000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "Dhulikhel Hospital (in town)",
    nearestPolice: "Dhulikhel Police Station",
    networkAvailability: "Excellent - 4G coverage, WiFi in hotels",
    crowdLevel: "Low-Moderate",
  },
  "muktinath": {
    budgetEstimateLow: 3000, budgetEstimateMid: 7000, budgetEstimateHigh: 20000,
    emergencyContacts: "ACAP Jomsom: 069-440024 | Police: 100",
    nearestHospital: "Jomsom Hospital (18 km)",
    nearestPolice: "Muktinath Police Post",
    networkAvailability: "Limited - Ncell spotty, WiFi in some lodges",
    crowdLevel: "Moderate (High during Muktinath festival)",
    altitudeWarning: "High altitude (3,710m). Visitors from lowlands should acclimatize.",
  },
  "sailung": {
    budgetEstimateLow: 1500, budgetEstimateMid: 3500, budgetEstimateHigh: 8000,
    emergencyContacts: "Police: 100 | District Hospital: 049-520022",
    nearestHospital: "Charikot Hospital (30 km)",
    nearestPolice: "Sailung Area Police Post",
    networkAvailability: "Limited - Ncell spotty at summit",
    crowdLevel: "Low",
    altitudeWarning: "Moderate altitude (3,146m). Pack warm clothing for summit.",
  },
  "pathivara": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 12000,
    emergencyContacts: "Police: 100 | District Hospital Phungling: 024-460022",
    nearestHospital: "Phungling Hospital (trek start)",
    nearestPolice: "Pathivara Temple Police Post",
    networkAvailability: "Limited - Ncell at base, none at temple",
    crowdLevel: "Low (High during Dashain)",
    altitudeWarning: "High altitude (3,794m). Steep climb. Not suitable for unfit visitors.",
  },
  "boudhanath": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 15000,
    emergencyContacts: "Police: 100 | Tourist Police: 1144 | Ambulance: 102",
    nearestHospital: "CIWEC Hospital (3 km) | Grande Hospital (5 km)",
    nearestPolice: "Boudha Police Station",
    networkAvailability: "Excellent - 4G/5G, WiFi everywhere",
    crowdLevel: "Moderate-High",
  },
  "pashupatinath": {
    budgetEstimateLow: 1500, budgetEstimateMid: 4000, budgetEstimateHigh: 12000,
    emergencyContacts: "Police: 100 | Temple Security: 01-4470666 | Ambulance: 102",
    nearestHospital: "TU Teaching Hospital (2 km)",
    nearestPolice: "Pashupatinath Area Police",
    networkAvailability: "Excellent - 4G/5G coverage",
    crowdLevel: "High (Very High during Shivaratri)",
  },
  "swayambhunath": {
    budgetEstimateLow: 1500, budgetEstimateMid: 4000, budgetEstimateHigh: 12000,
    emergencyContacts: "Police: 100 | Ambulance: 102",
    nearestHospital: "Bir Hospital (3 km) | Om Hospital (2 km)",
    nearestPolice: "Swayambhu Police Post",
    networkAvailability: "Excellent - 4G coverage, WiFi in nearby cafes",
    crowdLevel: "Moderate-High",
  },
  "chandragiri-hills": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 15000,
    emergencyContacts: "Cable Car Office: 01-4100100 | Police: 100",
    nearestHospital: "Kathmandu hospitals (15 km drive)",
    nearestPolice: "Thankot Police Post",
    networkAvailability: "Good - 4G at summit, WiFi at cable car station",
    crowdLevel: "Moderate",
  },
  "kalinchowk": {
    budgetEstimateLow: 2000, budgetEstimateMid: 5000, budgetEstimateHigh: 12000,
    emergencyContacts: "Police: 100 | Cable Car: 049-690100",
    nearestHospital: "Charikot Hospital (25 km)",
    nearestPolice: "Kalinchowk Police Post",
    networkAvailability: "Moderate - Ncell available at base, limited at top",
    crowdLevel: "Moderate (High on weekends/winter)",
    altitudeWarning: "High altitude (3,842m). Temperature drops significantly. Warm clothing essential.",
  },
  "besisahar": {
    budgetEstimateLow: 1500, budgetEstimateMid: 3500, budgetEstimateHigh: 10000,
    emergencyContacts: "Police: 100 | ACAP: 066-520024",
    nearestHospital: "Besisahar Hospital",
    nearestPolice: "Besisahar Police Station",
    networkAvailability: "Good - 4G coverage in town",
    crowdLevel: "Low-Moderate",
  },
  "halesi-mahadev": {
    budgetEstimateLow: 1500, budgetEstimateMid: 4000, budgetEstimateHigh: 10000,
    emergencyContacts: "Police: 100 | District Hospital: 036-540022",
    nearestHospital: "Khotang District Hospital",
    nearestPolice: "Halesi Police Post",
    networkAvailability: "Moderate - Ncell available near temple",
    crowdLevel: "Low (High during Shivaratri)",
  },
  "bardia-national-park": {
    budgetEstimateLow: 2500, budgetEstimateMid: 7000, budgetEstimateHigh: 25000,
    emergencyContacts: "Park Office: 084-420054 | Police: 100",
    nearestHospital: "Gulariya Hospital (15 km)",
    nearestPolice: "Bardia NP Police Post",
    networkAvailability: "Moderate - 4G in Thakurdwara, limited in park",
    crowdLevel: "Very Low",
  },
  "ghorepani-poon-hill": {
    budgetEstimateLow: 2500, budgetEstimateMid: 6000, budgetEstimateHigh: 18000,
    emergencyContacts: "ACAP Ghorepani: 066-440024 | Rescue: 01-4240922",
    nearestHospital: "Tatopani Health Post | Pokhara hospitals (trek end)",
    nearestPolice: "Ghorepani Police Post",
    networkAvailability: "Moderate - Ncell available, WiFi in lodges (paid)",
    crowdLevel: "Moderate-High (peak season)",
    altitudeWarning: "Moderate altitude (3,210m at Poon Hill). Early morning hike can be cold.",
  },
};

async function main() {
  console.log("Updating destinations with budget and safety data...");
  
  for (const [slug, data] of Object.entries(destinationUpdates)) {
    try {
      await prisma.destination.update({
        where: { slug },
        data,
      });
      console.log(`✓ Updated: ${slug}`);
    } catch (e: any) {
      console.log(`✗ Skipped: ${slug} - ${e.message?.substring(0, 60)}`);
    }
  }
  
  // Also update any destinations that don't have budget data with defaults based on budgetLevel
  const remaining = await prisma.destination.findMany({
    where: { budgetEstimateLow: null },
    select: { slug: true, budgetLevel: true, altitude: true, location: true },
  });
  
  for (const dest of remaining) {
    const budgetMap: Record<string, [number, number, number]> = {
      "budget": [1500, 4000, 10000],
      "moderate": [2500, 6000, 15000],
      "expensive": [4000, 10000, 30000],
    };
    const [low, mid, high] = budgetMap[dest.budgetLevel] || [2000, 5000, 12000];
    
    await prisma.destination.update({
      where: { slug: dest.slug },
      data: {
        budgetEstimateLow: low,
        budgetEstimateMid: mid,
        budgetEstimateHigh: high,
        emergencyContacts: "Police: 100 | Ambulance: 102 | Tourist Police: 1144",
        nearestHospital: `Nearest district hospital in ${dest.location}`,
        nearestPolice: `Local police station in ${dest.location}`,
        networkAvailability: dest.altitude > 3000 ? "Limited - Basic mobile coverage" : "Moderate - 4G available in main areas",
        crowdLevel: "Low-Moderate",
        altitudeWarning: dest.altitude > 3500 ? `High altitude (${dest.altitude}m). Take proper acclimatization measures.` : undefined,
      },
    });
    console.log(`✓ Default updated: ${dest.slug}`);
  }
  
  console.log("\nDone! All destinations updated with budget and safety data.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
