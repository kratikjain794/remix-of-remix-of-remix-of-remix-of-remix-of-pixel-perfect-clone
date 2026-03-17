import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Hospital, Patient, AppointmentRequest, HospitalSignupData, TransferRequest, ActiveAmbulance, EmergencyRequest } from '@/types/hospital';
import { allHospitals, defaultPatients } from '@/data/hospitals';

interface AppState {
  hospitals: Hospital[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loggedInHospitalId: string | null;
  login: (email: string, password: string) => boolean;
  adminLogin: (email: string, password: string) => boolean;
  signup: (data: HospitalSignupData) => boolean;
  logout: () => void;
  updateResource: (hospitalId: string, resource: string, delta: number) => void;
  getHospitalsByRegion: (region: string) => Hospital[];
  requests: AppointmentRequest[];
  addRequest: (req: Omit<AppointmentRequest, 'id' | 'status' | 'timestamp'>) => void;
  updateRequestStatus: (id: string, status: 'approved' | 'rejected') => void;
  transferRequests: TransferRequest[];
  addTransferRequest: (req: Omit<TransferRequest, 'id' | 'status' | 'timestamp'>) => void;
  updateTransferStatus: (id: string, status: 'approved' | 'rejected') => void;
  hospitalPatients: Record<string, Patient[]>;
  addPatientToHospital: (hospitalId: string, patient: Patient) => void;
  activeAmbulances: ActiveAmbulance[];
  emergencyRequests: EmergencyRequest[];
  addEmergencyRequest: (req: Omit<EmergencyRequest, 'id' | 'status' | 'timestamp'>) => void;
  updateEmergencyStatus: (id: string, status: 'active' | 'resolved') => void;
  getSignedUpHospitals: () => Hospital[];
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hospitals, setHospitals] = useState<Hospital[]>(allHospitals);
  const [selectedRegion, setSelectedRegion] = useState('Indore');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedInHospitalId, setLoggedInHospitalId] = useState<string | null>(null);
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<{ email: string; password: string; hospitalId: string }[]>([]);
  const [activeAmbulances, setActiveAmbulances] = useState<ActiveAmbulance[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  
  const [hospitalPatients, setHospitalPatients] = useState<Record<string, Patient[]>>(() => {
    const initial: Record<string, Patient[]> = {};
    allHospitals.forEach(h => {
      initial[h.id] = h.id === '1' ? [...defaultPatients] : [];
    });
    return initial;
  });

  const ambulanceTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    return () => {
      Object.values(ambulanceTimers.current).forEach(clearInterval);
    };
  }, []);

  const addPatientToHospital = useCallback((hospitalId: string, patient: Patient) => {
    setHospitalPatients(prev => ({
      ...prev,
      [hospitalId]: [...(prev[hospitalId] || []), patient],
    }));
  }, []);

  const removePatientFromHospital = useCallback((hospitalId: string, patientName: string) => {
    setHospitalPatients(prev => {
      const list = prev[hospitalId] || [];
      const idx = list.findIndex(p => p.name === patientName);
      if (idx === -1) return prev;
      const newList = [...list];
      newList.splice(idx, 1);
      return { ...prev, [hospitalId]: newList };
    });
  }, []);

  const getSignedUpHospitals = useCallback(() => {
    return hospitals.filter(h => h.id.startsWith('custom-'));
  }, [hospitals]);

  const login = useCallback((email: string, password: string) => {
    if (email === 'hospital@lifeline.in' && password === 'hospital123') {
      setIsLoggedIn(true);
      setLoggedInHospitalId('1');
      return true;
    }
    const found = registeredUsers.find(u => u.email === email && u.password === password);
    if (found) {
      setIsLoggedIn(true);
      setLoggedInHospitalId(found.hospitalId);
      return true;
    }
    return false;
  }, [registeredUsers]);

  const adminLogin = useCallback((email: string, password: string) => {
    if (email === 'admin@lifeline.in' && password === 'admin123') {
      setIsAdmin(true);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback((data: HospitalSignupData) => {
    const newId = `custom-${Date.now()}`;
    const newHospital: Hospital = {
      id: newId,
      name: data.name,
      location: data.location,
      city: data.city || 'Indore',
      type: data.type,
      tier: data.tier,
      alertLevel: 'Normal',
      rating: 3.5,
      coordinates: { lat: 22.72 + (Math.random() - 0.5) * 0.05, lng: 75.86 + (Math.random() - 0.5) * 0.05 },
      resources: {
        icuBeds: { used: 0, total: data.icuBeds },
        generalBeds: { used: 0, total: data.generalBeds },
        ventilators: { used: 0, total: data.ventilators },
        erBeds: { used: 0, total: data.erBeds },
        oxygenLevel: data.oxygenLevel,
        doctors: { available: data.doctors, total: data.doctors },
        bloodAvailable: data.bloodAvailable,
        patients: 0,
        ambulances: { available: data.ambulances, total: data.ambulances },
      },
      lastUpdated: 'Just now',
    };
    setHospitals(prev => [...prev, newHospital]);
    setHospitalPatients(prev => ({ ...prev, [newId]: [] }));
    setRegisteredUsers(prev => [...prev, { email: data.email, password: data.password, hospitalId: newId }]);
    setIsLoggedIn(true);
    setLoggedInHospitalId(newId);
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setLoggedInHospitalId(null);
  }, []);

  const updateResource = useCallback((hospitalId: string, resource: string, delta: number) => {
    setHospitals(prev => prev.map(h => {
      if (h.id !== hospitalId) return h;
      const res = { ...h.resources };
      switch (resource) {
        case 'icuBeds':
          res.icuBeds = { ...res.icuBeds, used: Math.max(0, Math.min(res.icuBeds.total, res.icuBeds.used + delta)) };
          break;
        case 'ventilators':
          res.ventilators = { ...res.ventilators, used: Math.max(0, Math.min(res.ventilators.total, res.ventilators.used + delta)) };
          break;
        case 'ambulances':
          res.ambulances = { ...res.ambulances, available: Math.max(0, Math.min(res.ambulances.total, res.ambulances.available + delta)) };
          break;
        case 'doctors':
          res.doctors = { ...res.doctors, available: Math.max(0, Math.min(res.doctors.total, res.doctors.available + delta)) };
          break;
        case 'oxygenBeds':
          res.erBeds = { ...res.erBeds, used: Math.max(0, Math.min(res.erBeds.total, res.erBeds.used + delta)) };
          break;
        case 'erBeds':
          res.generalBeds = { ...res.generalBeds, used: Math.max(0, Math.min(res.generalBeds.total, res.generalBeds.used + delta)) };
          break;
      }
      return { ...h, resources: res, lastUpdated: 'Just now' };
    }));
  }, []);

  const getHospitalsByRegion = useCallback((region: string) => {
    if (region === 'All Regions') return hospitals;
    return hospitals.filter(h => h.city === region);
  }, [hospitals]);

  const addRequest = useCallback((req: Omit<AppointmentRequest, 'id' | 'status' | 'timestamp'>) => {
    const newReq: AppointmentRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'pending',
      timestamp: new Date().toLocaleString(),
    };
    setRequests(prev => [newReq, ...prev]);
  }, []);

  const updateRequestStatus = useCallback((id: string, status: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  const addTransferRequest = useCallback((req: Omit<TransferRequest, 'id' | 'status' | 'timestamp'>) => {
    const newReq: TransferRequest = {
      ...req,
      id: `transfer-${Date.now()}`,
      status: 'pending',
      timestamp: new Date().toLocaleString(),
    };
    setTransferRequests(prev => [newReq, ...prev]);
    
    const existingPatients = hospitalPatients[req.fromHospitalId] || [];
    const alreadyExists = existingPatients.some(p => p.name === req.patientName);
    if (!alreadyExists) {
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        name: req.patientName,
        age: 30,
        gender: 'M',
        ward: req.resourceType === 'ICU' ? 'ICU' : req.resourceType === 'ER' ? 'ER' : req.resourceType === 'Oxygen' ? 'Oxygen' : 'General',
        condition: 'Serious',
        doctor: 'Assigned on transfer',
        admittedAgo: 'Just now',
      };
      addPatientToHospital(req.fromHospitalId, newPatient);
    }
  }, [hospitalPatients, addPatientToHospital]);

  const startAmbulanceTracking = useCallback((transfer: TransferRequest) => {
    const ambulanceId = `amb-${Date.now()}`;
    const newAmbulance: ActiveAmbulance = {
      id: ambulanceId,
      transferId: transfer.id,
      fromHospitalId: transfer.fromHospitalId,
      toHospitalId: transfer.toHospitalId,
      patientName: transfer.patientName,
      progress: 0,
      startTime: Date.now(),
    };
    setActiveAmbulances(prev => [...prev, newAmbulance]);

    const timer = setInterval(() => {
      setActiveAmbulances(prev => {
        const updated = prev.map(a => {
          if (a.id !== ambulanceId) return a;
          const newProgress = Math.min(100, a.progress + 2);
          return { ...a, progress: newProgress };
        });
        
        const amb = updated.find(a => a.id === ambulanceId);
        if (amb && amb.progress >= 100) {
          clearInterval(timer);
          delete ambulanceTimers.current[ambulanceId];
          
          removePatientFromHospital(transfer.fromHospitalId, transfer.patientName);
          const transferredPatient: Patient = {
            id: `pat-transferred-${Date.now()}`,
            name: transfer.patientName,
            age: 30,
            gender: 'M',
            ward: transfer.resourceType === 'ICU' ? 'ICU' : transfer.resourceType === 'ER' ? 'ER' : transfer.resourceType === 'Oxygen' ? 'Oxygen' : 'General',
            condition: 'Serious',
            doctor: 'Assigned on arrival',
            admittedAgo: 'Just now',
          };
          addPatientToHospital(transfer.toHospitalId, transferredPatient);
          
          setTimeout(() => {
            setActiveAmbulances(p => p.filter(a => a.id !== ambulanceId));
          }, 5000);
        }
        
        return updated;
      });
    }, 3000);

    ambulanceTimers.current[ambulanceId] = timer;
  }, [removePatientFromHospital, addPatientToHospital]);

  const updateTransferStatus = useCallback((id: string, status: 'approved' | 'rejected') => {
    setTransferRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    if (status === 'approved') {
      const transfer = transferRequests.find(r => r.id === id);
      if (transfer) {
        startAmbulanceTracking({ ...transfer, status: 'approved' });
      }
    }
  }, [transferRequests, startAmbulanceTracking]);

  const addEmergencyRequest = useCallback((req: Omit<EmergencyRequest, 'id' | 'status' | 'timestamp'>) => {
    const newReq: EmergencyRequest = {
      ...req,
      id: `emer-${Date.now()}`,
      status: 'active',
      timestamp: new Date().toLocaleString(),
    };
    setEmergencyRequests(prev => [newReq, ...prev]);
  }, []);

  const updateEmergencyStatus = useCallback((id: string, status: 'active' | 'resolved') => {
    setEmergencyRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  return (
    <AppContext.Provider value={{
      hospitals, selectedRegion, setSelectedRegion, isLoggedIn, isAdmin, loggedInHospitalId,
      login, adminLogin, signup, logout, updateResource, getHospitalsByRegion,
      requests, addRequest, updateRequestStatus,
      transferRequests, addTransferRequest, updateTransferStatus,
      hospitalPatients, addPatientToHospital, activeAmbulances,
      emergencyRequests, addEmergencyRequest, updateEmergencyStatus,
      getSignedUpHospitals,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
