import { useApp } from '@/context/AppContext';
import { CalendarCheck, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function UserPage() {
  const { requests, emergencyRequests, hospitals } = useApp();

  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown Hospital';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Dashboard</h2>
        <p className="text-sm text-muted-foreground font-mono-code">View your appointment history and emergency requests</p>
      </div>

      {/* Appointment History */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Appointment History</h3>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{requests.length} total</span>
        </div>

        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No appointments yet. Book an appointment from the Resource Map by clicking "Request" on any hospital card.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{req.patientName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code flex items-center gap-1 ${
                      req.status === 'pending' ? 'bg-alert-yellow/20 text-alert-yellow' :
                      req.status === 'approved' ? 'bg-alert-green/20 text-alert-green' :
                      'bg-alert-red/20 text-alert-red'
                    }`}>
                      {req.status === 'pending' && <Clock className="w-3 h-3" />}
                      {req.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">🏥 {getHospitalName(req.hospitalId)}</p>
                  <p className="text-xs text-muted-foreground">{req.resourceType} · {req.reason}</p>
                  {req.phone && <p className="text-xs text-muted-foreground">📞 {req.phone}</p>}
                  <p className="text-[10px] text-muted-foreground font-mono-code mt-1">{req.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency History */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-alert-red">🚨</span>
          <h3 className="font-semibold text-foreground">Emergency History</h3>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{emergencyRequests.length} total</span>
        </div>

        {emergencyRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No emergency requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {emergencyRequests.map(req => (
              <div key={req.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground text-sm">{req.patientName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
                    req.status === 'active' ? 'bg-alert-red/20 text-alert-red' : 'bg-alert-green/20 text-alert-green'
                  }`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">🏥 Dispatched to: {req.hospitalName}</p>
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
