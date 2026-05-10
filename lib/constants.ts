export const CATEGORIES = [
  { name: "Mountains", slug: "mountain", icon: "Mountain", description: "Majestic Himalayan peaks" },
  { name: "Trekking", slug: "trekking", icon: "Footprints", description: "World-class trekking routes" },
  { name: "Nature", slug: "nature", icon: "TreePine", description: "Pristine natural beauty" },
  { name: "Cities", slug: "city", icon: "Building2", description: "Vibrant cultural hubs" },
  { name: "Adventure", slug: "adventure", icon: "Compass", description: "Thrilling experiences" },
  { name: "Temples", slug: "temple", icon: "Landmark", description: "Sacred spiritual sites" },
  { name: "Lakes", slug: "lake", icon: "Waves", description: "Serene alpine lakes" },
  { name: "Wildlife", slug: "wildlife", icon: "Bird", description: "Rich biodiversity" },
  { name: "Cultural", slug: "cultural", icon: "Palette", description: "Living heritage" },
  { name: "Hidden Gems", slug: "hidden-gem", icon: "Gem", description: "Off-the-beaten-path" },
  { name: "Cable Car", slug: "cable-car", icon: "CableCar", description: "Scenic aerial rides" },
] as const;

export const DIFFICULTY_LEVELS = ["easy", "moderate", "hard", "extreme"] as const;
export const BUDGET_LEVELS = ["budget", "moderate", "luxury"] as const;
export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export const DURATIONS = ["day-trip", "2-3-days", "week-long", "extended"] as const;

export const CDN_IMAGES: Record<string, string> = {
  "kathmandu": "https://cdn.abacus.ai/images/bf412de7-931b-4b5a-94cc-e2e6b057341c.png",
  "pokhara": "https://cdn.abacus.ai/images/3e99d2c5-ded1-456e-9d7e-b4466aae4275.png",
  "everest-base-camp": "https://cdn.abacus.ai/images/9084eac5-2563-4a37-a773-76df4b01f814.png",
  "annapurna-circuit": "https://cdn.abacus.ai/images/ec98d4bf-5702-4a44-a683-33503d937038.png",
  "chitwan-national-park": "https://cdn.abacus.ai/images/f0279169-848e-46e3-995e-1bca66daec8f.png",
  "lumbini": "https://cdn.abacus.ai/images/03a51d8d-1e56-4815-9208-ca9e14c8d16e.png",
  "rara-lake": "https://cdn.abacus.ai/images/14ba0c9c-fb8c-4d50-b336-35500aa01c4a.png",
  "bandipur": "https://cdn.abacus.ai/images/d224bf3d-8ab2-4c3e-9509-457c30c10a08.png",
  "nagarkot": "https://cdn.abacus.ai/images/d18daa4f-9009-4b6f-ad63-53b879673980.png",
  "patan": "https://cdn.abacus.ai/images/26a3e6ac-d730-429a-a7f7-d117a40cc684.png",
  "bhaktapur": "https://cdn.abacus.ai/images/11d61d2a-68a8-4a39-aaf9-8c343178cac7.png",
  "upper-mustang": "https://cdn.abacus.ai/images/06eb974b-75b2-4ba5-84d4-51eb032d01ac.png",
  "langtang-valley": "https://cdn.abacus.ai/images/b814911f-001a-4c3e-9ae1-45f7fae51472.png",
  "gosaikunda": "https://cdn.abacus.ai/images/e661b4c5-daea-4973-b6fe-2801517b9485.png",
  "tilicho-lake": "https://cdn.abacus.ai/images/4a51df8d-043e-42aa-9d29-ea18f90ff4c8.png",
  "manaslu-circuit": "https://cdn.abacus.ai/images/2194948d-903d-431b-ab7c-995b3581729a.png",
  "ilam": "https://cdn.abacus.ai/images/f64235eb-b542-43f9-904f-0595eef38f2b.png",
  "janakpur": "https://cdn.abacus.ai/images/5ccc653b-7e71-4ce9-b300-a73898c0617d.png",
  "bardia-national-park": "https://cdn.abacus.ai/images/1c7a21d0-fabe-44b8-8d5f-bdf3caf29558.png",
  "ghorepani-poon-hill": "https://cdn.abacus.ai/images/47efc461-a804-41b7-9038-615c99b0af94.png",
  "chandragiri-hills": "https://cdn.abacus.ai/images/48e57738-01bc-421a-af99-c619f86bc990.png",
  "daman": "https://cdn.abacus.ai/images/5a4e2e5b-d71a-406a-b35c-e208ef99aee6.png",
  "sagarmatha-national-park": "https://cdn.abacus.ai/images/d3a8ad4a-c191-490b-a433-4a7b2a96b591.png",
  "swayambhunath": "https://cdn.abacus.ai/images/ea47172a-e042-4f1f-a916-a1e1e9973af1.png",
  "pashupatinath": "https://cdn.abacus.ai/images/2ab6519e-9a19-4fa7-878e-d4e4c8443bce.png",
  "khaptad-national-park": "https://cdn.abacus.ai/images/d47c1c2b-edc4-4081-9104-29e315779b0d.png",
  "tsho-rolpa-lake": "https://cdn.abacus.ai/images/2cd5b8f2-90e1-4cb9-81c6-d3a565a9ae0b.png",
  "phoksundo-lake": "https://cdn.abacus.ai/images/71bc705d-5206-4b7c-b64b-e3844352387d.png",
};
