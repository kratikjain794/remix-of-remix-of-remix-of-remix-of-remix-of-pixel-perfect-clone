import { useState } from 'react';
import { Hospital, AlertLevel } from '@/types/hospital';
import { useApp } from '@/context/AppContext';
import { CalendarPlus, X, Send, Star } from 'lucide-react';

function AlertBadge({ level }: { level: AlertLevel }) {
  const cls = level === 'Red' ? 'badge-red' : level === 'Orange' ? 'badge-orange' : level === 'Yellow' ? 'badge-yellow' : 'badge-normal';
  return <span className={cls}>{level}</span>;
}

function ProgressBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = Math.min(100, (used / Math.max(1, total)) * 100);
  return (
    <div className="w-full bg-secondary rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function getBarColor(used: number, total: number) {
  const pct = used / Math.max(1, total);
  if (pct >= 0.9) return 'bg-alert-red';
  if (pct >= 0.7) return 'bg-alert-orange';
  if (pct >= 0.5) return 'bg-alert-yellow';
  return 'bg-alert-green';
}

export default function HospitalCard({ hospital, hideRequest = false }: { hospital: Hospital; hideRequest?: boolean }) {
  const r = hospital.resources;
  const { addRequest } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [resourceType, setResourceType] = useState('General');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    addRequest({
      hospitalId: hospital.id,
      patientName: name.trim() || 'Anonymous',
      phone: phone.trim(),
      reason: reason.trim(),
      resourceType,
    });
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setName(''); setPhone(''); setReason(''); }, 2000);
  };

  const inputCls = "w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="hospital-card flex flex-col gap-3 relative">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{hospital.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">📍 {hospital.location} · {hospital.type} · {hospital.tier}</p>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${star <= Math.round(hospital.rating) ? 'fill-alert-yellow text-alert-yellow' : 'text-muted-foreground/30'}`}
              />
            ))}
            <span className="text-xs text-muted-foreground font-mono-code ml-1">{hospital.rating.toFixed(1)}</span>
          </div>
        </div>
        <AlertBadge level={hospital.alertLevel} />
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">ICU Beds</span>
            <span className="font-mono-code tabular-nums">{r.icuBeds.used}/{r.icuBeds.total}</span>
          </div>
          <ProgressBar used={r.icuBeds.used} total={r.icuBeds.total} color={getBarColor(r.icuBeds.used, r.icuBeds.total)} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">General Beds</span>
            <span className="font-mono-code tabular-nums">{r.generalBeds.used}/{r.generalBeds.total}</span>
          </div>
          <ProgressBar used={r.generalBeds.used} total={r.generalBeds.total} color={getBarColor(r.generalBeds.used, r.generalBeds.total)} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Ventilators</span>
            <span className="font-mono-code tabular-nums">{r.ventilators.used}/{r.ventilators.total}</span>
          </div>
          <ProgressBar used={r.ventilators.used} total={r.ventilators.total} color={getBarColor(r.ventilators.used, r.ventilators.total)} />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-primary font-mono-code">O₂ {r.oxygenLevel}%</span>
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono-code">⚕ {r.doctors.available}/{r.doctors.total}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono-code">👥 {r.patients}</span>
        {r.bloodAvailable && <span className="text-xs px-2 py-0.5 rounded bg-secondary text-alert-red font-mono-code">♥ BLOOD</span>}
      </div>

      <div className="flex items-center justify-between mt-1">
        <p className="text-[10px] font-mono-code text-muted-foreground">⚡ {hospital.lastUpdated}</p>
        {!hideRequest && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
          >
            <CalendarPlus className="w-3 h-3" /> Request
          </button>
        )}
      </div>

      {!hideRequest && showForm && (
        <div className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-lg border border-primary/20 p-4 z-10 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">Book Appointment</h4>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {submitted ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-primary font-medium">✓ Request sent to {hospital.name}!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2">
              <input placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              <input placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
              <select value={resourceType} onChange={e => setResourceType(e.target.value)} className={inputCls}>
                <option>General</option><option>ICU</option><option>ER</option><option>Ventilator</option><option>Oxygen</option><option>Blood</option>
              </select>
              <textarea placeholder="Reason for visit *" value={reason} onChange={e => setReason(e.target.value)} rows={2} className={inputCls + ' min-h-0'} />
              <button type="submit" className="mt-auto flex items-center justify-center gap-1 bg-primary text-primary-foreground text-xs font-medium py-2 rounded-md hover:bg-primary/90 transition-colors">
                <Send className="w-3 h-3" /> Send Request
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
