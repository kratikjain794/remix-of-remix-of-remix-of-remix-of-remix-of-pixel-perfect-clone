import { Hospital, Patient, RegionSummary } from '@/types/hospital';

export const indoreHospitals: Hospital[] = [
  {
    id: '1', name: 'Care CHL Hospital', location: 'AB Road, Indore', city: 'Indore',
    type: 'Private', tier: 'Quaternary', alertLevel: 'Yellow', rating: 4.5,
    coordinates: { lat: 22.7196, lng: 75.8577 },
    resources: { icuBeds: { used: 73, total: 100 }, generalBeds: { used: 410, total: 500 }, ventilators: { used: 34, total: 45 }, oxygenLevel: 100, erBeds: { used: 6, total: 12 }, doctors: { available: 6, total: 12 }, bloodAvailable: true, patients: 11, ambulances: { available: 5, total: 12 } },
    lastUpdated: 'Just now',
  },
  {
    id: '2', name: 'MY Hospital (Govt)', location: 'MY Hospital Rd, Indore', city: 'Indore',
    type: 'Government', tier: 'Tertiary', alertLevel: 'Orange', rating: 3.8,
    coordinates: { lat: 22.7241, lng: 75.8655 },
    resources: { icuBeds: { used: 48, total: 60 }, generalBeds: { used: 450, total: 600 }, ventilators: { used: 17, total: 25 }, oxygenLevel: 93, erBeds: { used: 4, total: 10 }, doctors: { available: 10, total: 10 }, bloodAvailable: true, patients: 10, ambulances: { available: 6, total: 10 } },
    lastUpdated: 'Just now',
  },
  {
    id: '3', name: 'Bombay Hospital Indore', location: 'Ring Road, Indore', city: 'Indore',
    type: 'Private', tier: 'Tertiary', alertLevel: 'Yellow', rating: 4.2,
    coordinates: { lat: 22.7533, lng: 75.8937 },
    resources: { icuBeds: { used: 36, total: 50 }, generalBeds: { used: 220, total: 300 }, ventilators: { used: 9, total: 20 }, oxygenLevel: 93, erBeds: { used: 3, total: 8 }, doctors: { available: 5, total: 8 }, bloodAvailable: true, patients: 6, ambulances: { available: 3, total: 8 } },
    lastUpdated: 'Just now',
  },
  {
    id: '4', name: 'Choithram Hospital', location: 'Manik Bagh Road, Indore', city: 'Indore',
    type: 'Trust', tier: 'Tertiary', alertLevel: 'Orange', rating: 4.0,
    coordinates: { lat: 22.6946, lng: 75.8472 },
    resources: { icuBeds: { used: 20, total: 40 }, generalBeds: { used: 180, total: 250 }, ventilators: { used: 8, total: 15 }, oxygenLevel: 88, erBeds: { used: 3, total: 6 }, doctors: { available: 4, total: 7 }, bloodAvailable: true, patients: 8, ambulances: { available: 2, total: 5 } },
    lastUpdated: '2m ago',
  },
  {
    id: '5', name: 'Medanta Super Specialty', location: 'Vijay Nagar, Indore', city: 'Indore',
    type: 'Private', tier: 'Quaternary', alertLevel: 'Normal', rating: 4.7,
    coordinates: { lat: 22.7496, lng: 75.8942 },
    resources: { icuBeds: { used: 10, total: 80 }, generalBeds: { used: 100, total: 400 }, ventilators: { used: 5, total: 30 }, oxygenLevel: 98, erBeds: { used: 2, total: 10 }, doctors: { available: 8, total: 10 }, bloodAvailable: true, patients: 5, ambulances: { available: 4, total: 8 } },
    lastUpdated: '1m ago',
  },
  {
    id: '6', name: 'Index Medical College', location: 'Nemawar Road, Indore', city: 'Indore',
    type: 'Private', tier: 'Tertiary', alertLevel: 'Yellow', rating: 3.6,
    coordinates: { lat: 22.6520, lng: 75.8010 },
    resources: { icuBeds: { used: 15, total: 35 }, generalBeds: { used: 120, total: 200 }, ventilators: { used: 6, total: 12 }, oxygenLevel: 85, erBeds: { used: 2, total: 5 }, doctors: { available: 3, total: 6 }, bloodAvailable: false, patients: 4, ambulances: { available: 1, total: 3 } },
    lastUpdated: '3m ago',
  },
];

export const sagarHospitals: Hospital[] = [
  {
    id: '7', name: 'Apollo Clinic Sagar', location: 'Sagar', city: 'Sagar',
    type: 'Private', tier: 'Secondary', alertLevel: 'Normal', rating: 4.1,
    coordinates: { lat: 23.8388, lng: 78.7378 },
    resources: { icuBeds: { used: 6, total: 18 }, generalBeds: { used: 18, total: 80 }, ventilators: { used: 4, total: 7 }, oxygenLevel: 95, erBeds: { used: 1, total: 4 }, doctors: { available: 3, total: 4 }, bloodAvailable: true, patients: 10, ambulances: { available: 2, total: 3 } },
    lastUpdated: '5m ago',
  },
  {
    id: '8', name: 'Bundelkhand Medical College', location: 'Sagar', city: 'Sagar',
    type: 'Government', tier: 'Tertiary', alertLevel: 'Yellow', rating: 3.4,
    coordinates: { lat: 23.8465, lng: 78.7500 },
    resources: { icuBeds: { used: 28, total: 35 }, generalBeds: { used: 345, total: 400 }, ventilators: { used: 14, total: 18 }, oxygenLevel: 82, erBeds: { used: 5, total: 7 }, doctors: { available: 4, total: 7 }, bloodAvailable: true, patients: 18, ambulances: { available: 3, total: 5 } },
    lastUpdated: '2m ago',
  },
];

export const katniHospitals: Hospital[] = [
  {
    id: '9', name: 'City Hospital Katni', location: 'Katni', city: 'Katni',
    type: 'Government', tier: 'Secondary', alertLevel: 'Red', rating: 2.9,
    coordinates: { lat: 23.8344, lng: 80.3933 },
    resources: { icuBeds: { used: 15, total: 15 }, generalBeds: { used: 110, total: 120 }, ventilators: { used: 5, total: 5 }, oxygenLevel: 48, erBeds: { used: 2, total: 2 }, doctors: { available: 1, total: 2 }, bloodAvailable: false, patients: 5, ambulances: { available: 1, total: 2 } },
    lastUpdated: '3m ago',
  },
];

export const jabalpurHospitals: Hospital[] = [
  {
    id: '10', name: 'Gokuldas Hospital', location: 'Jabalpur', city: 'Jabalpur',
    type: 'Private', tier: 'Secondary', alertLevel: 'Yellow', rating: 3.9,
    coordinates: { lat: 23.1815, lng: 79.9864 },
    resources: { icuBeds: { used: 15, total: 20 }, generalBeds: { used: 78, total: 100 }, ventilators: { used: 5, total: 8 }, oxygenLevel: 85, erBeds: { used: 1, total: 3 }, doctors: { available: 2, total: 3 }, bloodAvailable: true, patients: 8, ambulances: { available: 2, total: 4 } },
    lastUpdated: '1m ago',
  },
];

export const allHospitals: Hospital[] = [
  ...indoreHospitals,
  ...sagarHospitals,
  ...katniHospitals,
  ...jabalpurHospitals,
];

export const defaultPatients: Patient[] = [
  { id: '1', name: 'Rajesh Sharma', age: 76, gender: 'F', ward: 'Oxygen', condition: 'Recovering', doctor: 'Dr. N. Agarwal', admittedAgo: '1h ago' },
  { id: '2', name: 'Priya Patel', age: 54, gender: 'F', ward: 'ER', condition: 'Recovering', doctor: 'Dr. A. Nair', admittedAgo: '28h ago' },
  { id: '3', name: 'Amit Verma', age: 61, gender: 'F', ward: 'ER', condition: 'Serious', doctor: 'Dr. K. Jha', admittedAgo: '18h ago' },
  { id: '4', name: 'Sunita Joshi', age: 59, gender: 'M', ward: 'General', condition: 'Stable', doctor: 'Dr. M. Patel', admittedAgo: '36h ago' },
  { id: '5', name: 'Vikram Singh', age: 60, gender: 'M', ward: 'ER', condition: 'Recovering', doctor: 'Dr. A. Nair', admittedAgo: '15h ago' },
  { id: '6', name: 'Anita Dubey', age: 21, gender: 'M', ward: 'General', condition: 'Critical', doctor: 'Dr. P. Deshmukh', admittedAgo: '15h ago' },
  { id: '7', name: 'Ravi Gupta', age: 42, gender: 'F', ward: 'ER', condition: 'Recovering', doctor: 'Dr. M. Patel', admittedAgo: '47h ago' },
  { id: '8', name: 'Meena Tiwari', age: 40, gender: 'M', ward: 'General', condition: 'Recovering', doctor: 'Dr. R. Mehta', admittedAgo: '47h ago' },
  { id: '9', name: 'Suresh Yadav', age: 71, gender: 'F', ward: 'General', condition: 'Stable', doctor: 'Dr. M. Patel', admittedAgo: '48h ago' },
  { id: '10', name: 'Kavita Sharma', age: 35, gender: 'F', ward: 'ICU', condition: 'Critical', doctor: 'Dr. N. Agarwal', admittedAgo: '2h ago' },
  { id: '11', name: 'Deepak Kumar', age: 48, gender: 'M', ward: 'Oxygen', condition: 'Serious', doctor: 'Dr. K. Jha', admittedAgo: '6h ago' },
];

// Keep backward compat
export const patients = defaultPatients;

export function getRegionSummary(hospitals: Hospital[]): RegionSummary {
  return hospitals.reduce(
    (acc, h) => ({
      activeEmergencies: acc.activeEmergencies,
      icuAvailable: acc.icuAvailable + (h.resources.icuBeds.total - h.resources.icuBeds.used),
      ventilators: acc.ventilators + (h.resources.ventilators.total - h.resources.ventilators.used),
      ambulances: acc.ambulances + h.resources.ambulances.available,
      erDoctors: acc.erDoctors + h.resources.doctors.available,
      oxygenBeds: acc.oxygenBeds + (h.resources.erBeds.total - h.resources.erBeds.used) + Math.floor(h.resources.oxygenLevel * 0.5),
      patients: acc.patients + h.resources.patients,
    }),
    { activeEmergencies: 0, icuAvailable: 0, ventilators: 0, ambulances: 0, erDoctors: 0, oxygenBeds: 0, patients: 0 }
  );
}

export function getAlertCounts(hospitals: Hospital[]) {
  return {
    red: hospitals.filter(h => h.alertLevel === 'Red').length,
    orange: hospitals.filter(h => h.alertLevel === 'Orange').length,
    yellow: hospitals.filter(h => h.alertLevel === 'Yellow').length,
    normal: hospitals.filter(h => h.alertLevel === 'Normal').length,
  };
}
