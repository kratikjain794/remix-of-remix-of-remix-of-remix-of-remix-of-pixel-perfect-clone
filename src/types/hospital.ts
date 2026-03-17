export type AlertLevel = 'Red' | 'Orange' | 'Yellow' | 'Normal';

export interface HospitalResource {
  icuBeds: { used: number; total: number };
  generalBeds: { used: number; total: number };
  ventilators: { used: number; total: number };
  oxygenLevel: number;
  erBeds: { used: number; total: number };
  doctors: { available: number; total: number };
  bloodAvailable: boolean;
  patients: number;
  ambulances: { available: number; total: number };
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  type: 'Private' | 'Government' | 'Trust';
  tier: 'Primary' | 'Secondary' | 'Tertiary' | 'Quaternary';
  alertLevel: AlertLevel;
  resources: HospitalResource;
  rating: number;
  lastUpdated: string;
  coordinates?: { lat: number; lng: number };
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  ward: 'ICU' | 'ER' | 'General' | 'Oxygen';
  condition: 'Critical' | 'Serious' | 'Recovering' | 'Stable';
  doctor: string;
  admittedAgo: string;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  mobile: string;
  location: string;
  targetHospitalId: string;
  hospitalName: string;
  status: 'active' | 'resolved';
  timestamp: string;
}

export interface AppointmentRequest {
  id: string;
  hospitalId: string;
  patientName: string;
  phone: string;
  reason: string;
  resourceType: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface TransferRequest {
  id: string;
  fromHospitalId: string;
  toHospitalId: string;
  patientName: string;
  resourceType: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface ActiveAmbulance {
  id: string;
  transferId: string;
  fromHospitalId: string;
  toHospitalId: string;
  patientName: string;
  progress: number;
  startTime: number;
}

export interface HospitalSignupData {
  name: string;
  email: string;
  password: string;
  location: string;
  city: string;
  type: 'Private' | 'Government' | 'Trust';
  tier: 'Primary' | 'Secondary' | 'Tertiary' | 'Quaternary';
  icuBeds: number;
  generalBeds: number;
  ventilators: number;
  erBeds: number;
  oxygenLevel: number;
  doctors: number;
  ambulances: number;
  bloodAvailable: boolean;
}

export interface RegionSummary {
  activeEmergencies: number;
  icuAvailable: number;
  ventilators: number;
  ambulances: number;
  erDoctors: number;
  oxygenBeds: number;
  patients: number;
}
