import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getRegionSummary } from '@/data/hospitals';
import StatsRow from '@/components/StatsRow';
import AIChatbot from '@/components/AIChatbot';
import HospitalCard from '@/components/HospitalCard';
import HospitalLogin from '@/pages/HospitalLogin';
import AmbulanceTrackingMap from '@/components/AmbulanceTrackingMap';
import { Search, Check, X, ArrowRightLeft, Send, Bell, MapPin } from 'lucide-react';

const tabs = ['Health Care Resource Platform', 'Update Resources', 'Patient Transfer', 'Live Tracking', 'Requests', 'Emergencies', 'Patients'] as const;

function UpdateResources() {
  const { hospitals, updateResource, loggedInHospitalId } = useApp();
  const hospital = hospitals.find(h => h.id === loggedInHospitalId) || hospitals[0];

  const resources = [
    { key: 'icuBeds', label: 'ICU Beds', icon: '🛏', value: hospital.resources.icuBeds.used, total: hospital.resources.icuBeds.total },
    { key: 'ventilators', label: 'Ventilators', icon: '💨', value: hospital.resources.ventilators.used, total: hospital.resources.ventilators.total },
    { key: 'ambulances', label: 'Ambulances', icon: '📍', value: hospital.resources.ambulances.available, total: hospital.resources.ambulances.total },
    { key: 'doctors', label: 'Emergency Doctors', icon: '⚕', value: hospital.resources.doctors.available, total: hospital.resources.doctors.total },
    { key: 'oxygenBeds', label: 'Oxygen Beds', icon: '💧', value: hospital.resources.erBeds.used, total: hospital.resources.erBeds.total },
    { key: 'erBeds', label: 'ER Beds', icon: '🛏', value: hospital.resources.generalBeds.used, total: hospital.resources.generalBeds.total },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">🏥</span>
        <h3 className="font-semibold text-foreground">{hospital.name}</h3>
        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{hospital.location}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map(r => (
          <div key={r.key} className="stat-card">
            <div className="flex items-center gap-1.5 mb-3">
              <span>{r.icon}</span>
              <span className="text-sm text-muted-foreground">{r.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => updateResource(hospital.id, r.key, -1)} className="w-12 h-12 border border-border rounded-lg flex items-center justify-center text-xl text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">−</button>
              <div className="text-center">
                <span className="text-4xl font-bold text-alert-green tabular-nums">{r.value}</span>
                <p className="text-sm text-muted-foreground font-mono-code">/ {r.total}</p>
              </div>
              <button onClick={() => updateResource(hospital.id, r.key, 1)} className="w-12 h-12 border border-border rounded-lg flex items-center justify-center text-xl text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientTransferTab() {
  const { hospitals, loggedInHospitalId, addTransferRequest, transferRequests } = useApp();
  const currentHospital = hospitals.find(h => h.id === loggedInHospitalId) || hospitals[0];
  const otherHospitals = hospitals.filter(h => h.id !== currentHospital.id);

  const [patientName, setPatientName] = useState('');
  const [resourceType, setResourceType] = useState('ICU');
  const [reason, setReason] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Find hospitals with available resources
  const suitableHospitals = otherHospitals.filter(h => {
    if (resourceType === 'ICU') return h.resources.icuBeds.total - h.resources.icuBeds.used > 0;
    if (resourceType === 'Ventilator') return h.resources.ventilators.total - h.resources.ventilators.used > 0;
    if (resourceType === 'ER') return h.resources.erBeds.total - h.resources.erBeds.used > 0;
    if (resourceType === 'General') return h.resources.generalBeds.total - h.resources.generalBeds.used > 0;
    if (resourceType === 'Oxygen') return h.resources.oxygenLevel > 50;
    if (resourceType === 'Blood') return h.resources.bloodAvailable;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !selectedHospitalId || !reason.trim()) return;
    addTransferRequest({
      fromHospitalId: currentHospital.id,
      toHospitalId: selectedHospitalId,
      patientName: patientName.trim(),
      resourceType,
      reason: reason.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPatientName('');
      setReason('');
      setSelectedHospitalId('');
    }, 2000);
  };

  const myTransfers = transferRequests.filter(
    t => t.fromHospitalId === currentHospital.id || t.toHospitalId === currentHospital.id
  );

  const inputCls = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-6">
      {/* Workflow steps */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-primary" /> Patient Transfer Workflow
        </h4>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {[
            { step: '1', label: 'Patient in Hospital', icon: '🏥' },
            { step: '2', label: 'Search Resources', icon: '🔍' },
            { step: '3', label: 'Find Suitable Hospital', icon: '📍' },
            { step: '4', label: 'Send Transfer Request', icon: '✉️' },
            { step: '5', label: 'Request Received', icon: '🔔' },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className="flex flex-col items-center text-center min-w-[100px]">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg mb-1">
                  {s.icon}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{s.label}</span>
              </div>
              {i < 4 && <span className="text-primary text-lg shrink-0">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer form */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" /> Initiate Transfer from {currentHospital.name}
          </h4>
          {submitted ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-primary font-medium">✓ Transfer request sent! Pre-alert dispatched.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Patient Name *" value={patientName} onChange={e => setPatientName(e.target.value)} className={inputCls} />
              <select value={resourceType} onChange={e => setResourceType(e.target.value)} className={inputCls}>
                <option>ICU</option><option>General</option><option>ER</option><option>Ventilator</option><option>Oxygen</option><option>Blood</option>
              </select>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Suitable hospitals with available {resourceType} ({suitableHospitals.length} found)
                </label>
                <select value={selectedHospitalId} onChange={e => setSelectedHospitalId(e.target.value)} className={inputCls}>
                  <option value="">Select destination hospital</option>
                  {suitableHospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                  ))}
                </select>
              </div>
              <textarea placeholder="Reason for transfer *" value={reason} onChange={e => setReason(e.target.value)} rows={2} className={inputCls} />
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-md hover:bg-primary/90 transition-colors">
                <Send className="w-3.5 h-3.5" /> Send Transfer Request & Pre-Alert
              </button>
            </form>
          )}
        </div>

        {/* Transfer history */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-alert-yellow" /> Transfer History
          </h4>
          {myTransfers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No transfer requests yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {myTransfers.map(t => {
                const from = hospitals.find(h => h.id === t.fromHospitalId);
                const to = hospitals.find(h => h.id === t.toHospitalId);
                return (
                  <div key={t.id} className="border border-border rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{t.patientName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
                        t.status === 'pending' ? 'bg-alert-yellow/20 text-alert-yellow' :
                        t.status === 'approved' ? 'bg-alert-green/20 text-alert-green' :
                        'bg-alert-red/20 text-alert-red'
                      }`}>{t.status.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{from?.name} → {to?.name}</p>
                    <p className="text-xs text-muted-foreground">{t.resourceType} · {t.reason}</p>
                    <p className="text-[10px] text-muted-foreground font-mono-code mt-1">{t.timestamp}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestsTab() {
  const { requests, updateRequestStatus, hospitals, loggedInHospitalId, transferRequests, updateTransferStatus } = useApp();
  
  const hospitalRequests = loggedInHospitalId
    ? requests.filter(r => r.hospitalId === loggedInHospitalId)
    : requests;

  // Incoming transfer requests (where this hospital is the destination)
  const incomingTransfers = loggedInHospitalId
    ? transferRequests.filter(r => r.toHospitalId === loggedInHospitalId)
    : [];

  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Incoming Transfer Requests */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary">🔄</span>
          <h3 className="font-semibold text-foreground">Incoming Transfer Requests</h3>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
            {incomingTransfers.filter(r => r.status === 'pending').length} pending
          </span>
        </div>
        {incomingTransfers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No incoming transfer requests</p>
        ) : (
          <div className="space-y-3">
            {incomingTransfers.map(req => (
              <div key={req.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{req.patientName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
                      req.status === 'pending' ? 'bg-alert-yellow/20 text-alert-yellow' :
                      req.status === 'approved' ? 'bg-alert-green/20 text-alert-green' :
                      'bg-alert-red/20 text-alert-red'
                    }`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">From: {getHospitalName(req.fromHospitalId)}</p>
                  <p className="text-xs text-muted-foreground">{req.resourceType} · {req.reason}</p>
                  <p className="text-[10px] text-muted-foreground font-mono-code mt-1">{req.timestamp}</p>
                </div>
                {req.status === 'pending' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => updateTransferStatus(req.id, 'approved')} className="w-8 h-8 rounded-md bg-alert-green/10 text-alert-green hover:bg-alert-green/20 flex items-center justify-center transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateTransferStatus(req.id, 'rejected')} className="w-8 h-8 rounded-md bg-alert-red/10 text-alert-red hover:bg-alert-red/20 flex items-center justify-center transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Requests */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary">📋</span>
          <h3 className="font-semibold text-foreground">Appointment Requests</h3>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
            {hospitalRequests.filter(r => r.status === 'pending').length} pending
          </span>
        </div>
        {hospitalRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No appointment requests yet</p>
        ) : (
          <div className="space-y-3">
            {hospitalRequests.map(req => (
              <div key={req.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{req.patientName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
                      req.status === 'pending' ? 'bg-alert-yellow/20 text-alert-yellow' :
                      req.status === 'approved' ? 'bg-alert-green/20 text-alert-green' :
                      'bg-alert-red/20 text-alert-red'
                    }`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  {!loggedInHospitalId && <p className="text-xs text-muted-foreground">→ {getHospitalName(req.hospitalId)}</p>}
                  <p className="text-xs text-muted-foreground">{req.resourceType} · {req.reason}</p>
                  {req.phone && <p className="text-xs text-muted-foreground">📞 {req.phone}</p>}
                  <p className="text-[10px] text-muted-foreground font-mono-code mt-1">{req.timestamp}</p>
                </div>
                {req.status === 'pending' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => updateRequestStatus(req.id, 'approved')} className="w-8 h-8 rounded-md bg-alert-green/10 text-alert-green hover:bg-alert-green/20 flex items-center justify-center transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="w-8 h-8 rounded-md bg-alert-red/10 text-alert-red hover:bg-alert-red/20 flex items-center justify-center transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmergenciesTab() {
  const { emergencyRequests, loggedInHospitalId, updateEmergencyStatus } = useApp();
  
  const hospitalEmergencies = loggedInHospitalId
    ? emergencyRequests.filter(r => r.targetHospitalId === loggedInHospitalId)
    : [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-alert-red">🔺</span>
        <h3 className="font-semibold">Emergency Requests</h3>
        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
          {hospitalEmergencies.filter(r => r.status === 'active').length} active
        </span>
      </div>
      {hospitalEmergencies.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No emergency requests yet. Emergency SOS requests from users will appear here.</p>
      ) : (
        <div className="space-y-3">
          {hospitalEmergencies.map(req => (
            <div key={req.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{req.patientName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
                    req.status === 'active' ? 'bg-alert-red/20 text-alert-red animate-pulse' : 'bg-alert-green/20 text-alert-green'
                  }`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">📍 {req.location}</p>
                {req.mobile && <p className="text-xs text-muted-foreground">📞 {req.mobile}</p>}
                <p className="text-[10px] text-muted-foreground font-mono-code mt-1">{req.timestamp}</p>
              </div>
              {req.status === 'active' && (
                <button
                  onClick={() => updateEmergencyStatus(req.id, 'resolved')}
                  className="text-xs px-3 py-1.5 rounded-md bg-alert-green/10 text-alert-green hover:bg-alert-green/20 transition-colors font-medium shrink-0"
                >
                  ✓ Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LiveTrackingTab() {
  const { loggedInHospitalId, activeAmbulances, hospitals } = useApp();

  const relevantAmbulances = activeAmbulances.filter(
    a => a.fromHospitalId === loggedInHospitalId || a.toHospitalId === loggedInHospitalId
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Live Ambulance Tracking</h3>
        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
          {relevantAmbulances.length} active
        </span>
      </div>

      <AmbulanceTrackingMap filterHospitalIds={loggedInHospitalId ? [loggedInHospitalId] : undefined} />

      {relevantAmbulances.length > 0 && (
        <div className="space-y-3">
          {relevantAmbulances.map(amb => {
            const fromH = hospitals.find(h => h.id === amb.fromHospitalId);
            const toH = hospitals.find(h => h.id === amb.toHospitalId);
            return (
              <div key={amb.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground text-sm">🚑 {amb.patientName}</span>
                  <span className="text-xs bg-alert-red/20 text-alert-red px-2 py-0.5 rounded font-mono-code animate-pulse">
                    IN TRANSIT
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{fromH?.name} → {toH?.name}</p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${amb.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono-code">{amb.progress}% complete</p>
              </div>
            );
          })}
        </div>
      )}

      {relevantAmbulances.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">No active ambulance transfers. Approve a transfer request to start tracking.</p>
      )}
    </div>
  );
}

function PatientsTab() {
  const { hospitalPatients, loggedInHospitalId, requests, emergencyRequests, hospitals } = useApp();
  const [wardFilter, setWardFilter] = useState('All Wards');
  const [search, setSearch] = useState('');

  const currentPatients = loggedInHospitalId ? (hospitalPatients[loggedInHospitalId] || []) : [];

  const hospitalRequests = loggedInHospitalId
    ? requests.filter(r => r.hospitalId === loggedInHospitalId)
    : [];

  const hospitalEmergencies = loggedInHospitalId
    ? emergencyRequests.filter(r => r.targetHospitalId === loggedInHospitalId)
    : [];

  const filtered = currentPatients.filter(p => {
    if (wardFilter !== 'All Wards' && p.ward !== wardFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const conditionClass = (c: string) => {
    if (c === 'Critical') return 'badge-red';
    if (c === 'Serious') return 'badge-orange';
    if (c === 'Recovering') return 'badge-normal';
    return 'badge-yellow';
  };

  const wardClass = () => 'text-xs px-2 py-0.5 rounded bg-secondary text-primary font-mono-code';

  return (
    <div className="space-y-6">
      {/* Admitted Patients */}
      <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span>👥</span>
            <h3 className="font-semibold">Admitted Patients</h3>
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select value={wardFilter} onChange={e => setWardFilter(e.target.value)} className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-foreground">
              <option>All Wards</option><option>ICU</option><option>ER</option><option>General</option><option>Oxygen</option>
            </select>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No patients admitted yet.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium">Patient</th>
                <th className="pb-2 font-medium">Age/Gender</th>
                <th className="pb-2 font-medium">Ward</th>
                <th className="pb-2 font-medium">Condition</th>
                <th className="pb-2 font-medium">Doctor</th>
                <th className="pb-2 font-medium text-right">Admitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 font-medium text-foreground">{p.name}</td>
                  <td className="py-3 text-muted-foreground">{p.age}{p.gender}</td>
                  <td className="py-3"><span className={wardClass()}>{p.ward}</span></td>
                  <td className="py-3"><span className={conditionClass(p.condition)}>{p.condition}</span></td>
                  <td className="py-3 text-muted-foreground">{p.doctor}</td>
                  <td className="py-3 text-right text-muted-foreground font-mono-code">{p.admittedAgo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Appointment Requests */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary">📋</span>
          <h3 className="font-semibold text-foreground">Appointment Requests</h3>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{hospitalRequests.length} total</span>
        </div>
        {hospitalRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">No appointment requests yet.</p>
        ) : (
          <div className="space-y-3">
            {hospitalRequests.map(req => (
              <div key={req.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{req.patientName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
                    req.status === 'pending' ? 'bg-alert-yellow/20 text-alert-yellow' :
                    req.status === 'approved' ? 'bg-alert-green/20 text-alert-green' :
                    'bg-alert-red/20 text-alert-red'
                  }`}>{req.status.toUpperCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{req.resourceType} · {req.reason}</p>
                {req.phone && <p className="text-xs text-muted-foreground">📞 {req.phone}</p>}
                <p className="text-[10px] text-muted-foreground font-mono-code mt-1">{req.timestamp}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Requests */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-alert-red">🚨</span>
          <h3 className="font-semibold text-foreground">Emergency Requests</h3>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{hospitalEmergencies.length} total</span>
        </div>
        {hospitalEmergencies.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">No emergency requests yet.</p>
        ) : (
          <div className="space-y-3">
            {hospitalEmergencies.map(req => (
              <div key={req.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{req.patientName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
                    req.status === 'active' ? 'bg-alert-red/20 text-alert-red' : 'bg-alert-green/20 text-alert-green'
                  }`}>{req.status.toUpperCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground">📍 {req.location}</p>
                {req.mobile && <p className="text-xs text-muted-foreground">📞 {req.mobile}</p>}
                <p className="text-[10px] text-muted-foreground font-mono-code mt-1">{req.timestamp}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HospitalPage() {
  const { isLoggedIn, hospitals, selectedRegion, loggedInHospitalId } = useApp();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Health Care Resource Platform');

  if (!isLoggedIn) return <HospitalLogin />;

  const regionHospitals = selectedRegion === 'All Regions' ? hospitals : hospitals.filter(h => h.city === selectedRegion);
  const summary = getRegionSummary(regionHospitals);
  const loggedInHospital = hospitals.find(h => h.id === loggedInHospitalId);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Hospital Dashboard</h2>
        <p className="text-sm font-mono-code text-muted-foreground">
          ⚡ {loggedInHospital ? loggedInHospital.name : 'Hospital Controller'} · Live Data
        </p>
      </div>

      <div className="flex items-center gap-1 flex-wrap overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`whitespace-nowrap ${activeTab === t ? 'nav-tab-active' : 'nav-tab'} text-xs sm:text-sm`}>
            {t === 'Health Care Resource Platform' && '🔲 '}
            {t === 'Update Resources' && '🛏 '}
            {t === 'Patient Transfer' && '🔄 '}
            {t === 'Live Tracking' && '📍 '}
            {t === 'Requests' && '📋 '}
            {t === 'Emergencies' && '⚠ '}
            {t === 'Patients' && '👥 '}
            <span className="hidden sm:inline">{t}</span>
            <span className="sm:hidden">{t === 'Health Care Resource Platform' ? 'Overview' : t === 'Update Resources' ? 'Update' : t === 'Patient Transfer' ? 'Transfer' : t === 'Live Tracking' ? 'Track' : t}</span>
          </button>
        ))}
      </div>

      {activeTab === 'Health Care Resource Platform' && (
        <div className="space-y-6">
          <StatsRow summary={summary} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionHospitals.map(h => (
              <HospitalCard key={h.id} hospital={h} hideRequest />
            ))}
          </div>
        </div>
      )}
      {activeTab === 'Update Resources' && <UpdateResources />}
      {activeTab === 'Patient Transfer' && <PatientTransferTab />}
      {activeTab === 'Live Tracking' && <LiveTrackingTab />}
      {activeTab === 'Requests' && <RequestsTab />}
      {activeTab === 'Emergencies' && <EmergenciesTab />}
      {activeTab === 'Patients' && <PatientsTab />}
      <AIChatbot />
    </div>
  );
}
