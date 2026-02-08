// Curated dosage and frequency options for medication autocomplete
// These cover the most common medication dosing patterns in family caregiving

export const DOSAGE_OPTIONS = [
  // Common tablet/capsule strengths (mg)
  "1mg",
  "2mg",
  "2.5mg",
  "5mg",
  "7.5mg",
  "10mg",
  "12.5mg",
  "15mg",
  "20mg",
  "25mg",
  "30mg",
  "40mg",
  "50mg",
  "60mg",
  "75mg",
  "80mg",
  "100mg",
  "125mg",
  "150mg",
  "200mg",
  "250mg",
  "300mg",
  "325mg",
  "400mg",
  "500mg",
  "600mg",
  "650mg",
  "750mg",
  "800mg",
  "1000mg",
  // Microgram dosages (mcg)
  "25mcg",
  "50mcg",
  "75mcg",
  "100mcg",
  "125mcg",
  "150mcg",
  "200mcg",
  "250mcg",
  "300mcg",
  "400mcg",
  "500mcg",
  // Liquid dosages (mL)
  "1mL",
  "2.5mL",
  "5mL",
  "7.5mL",
  "10mL",
  "15mL",
  "20mL",
  "30mL",
  // Tablet counts
  "1/2 tablet",
  "1 tablet",
  "1.5 tablets",
  "2 tablets",
  "3 tablets",
  // Capsule counts
  "1 capsule",
  "2 capsules",
  // Insulin / injectable units
  "5 units",
  "10 units",
  "15 units",
  "20 units",
  "25 units",
  "30 units",
  "40 units",
  "50 units",
  "75 units",
  "100 units",
  // Inhalers
  "1 puff",
  "2 puffs",
  "3 puffs",
  "4 puffs",
  // Drops (eye/ear)
  "1 drop",
  "2 drops",
  "3 drops",
  // Topical
  "Apply thin layer",
  "Apply to affected area",
  "1 patch",
  // Sprays (nasal)
  "1 spray each nostril",
  "2 sprays each nostril",
  // Suppository
  "1 suppository",
  // Percentage-based (creams/ointments)
  "0.025%",
  "0.05%",
  "0.1%",
  "0.5%",
  "1%",
  "2%",
  "2.5%",
  "5%",
  "10%",
  // Teaspoon (common for liquid meds)
  "1/2 teaspoon (2.5mL)",
  "1 teaspoon (5mL)",
  "2 teaspoons (10mL)",
  "1 tablespoon (15mL)",
];

export const FREQUENCY_OPTIONS = [
  // Standard daily frequencies
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  // Time-specific
  "Every morning",
  "Every evening",
  "Every bedtime",
  "Morning and evening",
  "Morning, noon, and evening",
  "Morning, afternoon, and bedtime",
  // Hourly intervals
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "Every 24 hours",
  // Weekly
  "Once weekly",
  "Twice weekly",
  "Three times weekly",
  "Every other day",
  // Monthly/less frequent
  "Once monthly",
  "Every 2 weeks",
  "Every 3 months",
  // Meal-related
  "With meals",
  "With breakfast",
  "With lunch",
  "With dinner",
  "Before meals",
  "After meals",
  "30 minutes before meals",
  "With food",
  "On empty stomach",
  // As needed
  "As needed (PRN)",
  "As needed for pain",
  "As needed for nausea",
  "As needed for anxiety",
  "As needed for sleep",
  // Specific combos
  "Once daily at bedtime",
  "Once daily in the morning",
  "Twice daily with meals",
];

// Filter function - matches from start of words for better UX
export function filterDosageOptions(query) {
  if (!query || query.length < 1) return [];
  const lower = query.toLowerCase();
  return DOSAGE_OPTIONS
    .filter(item => item.toLowerCase().includes(lower))
    .slice(0, 10);
}

export function filterFrequencyOptions(query) {
  if (!query || query.length < 1) return [];
  const lower = query.toLowerCase();
  return FREQUENCY_OPTIONS
    .filter(item => item.toLowerCase().includes(lower))
    .slice(0, 10);
}
