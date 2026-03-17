import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getRegionSummary, getAlertCounts } from '@/data/hospitals';
import StatsRow from '@/components/StatsRow';
import HospitalCard from '@/components/HospitalCard';
import { Search, Check } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';

const CHART_COLORS = [
  'hsl(174 72% 46%)', 'hsl(30 95% 55%)', 'hsl(0 72% 51%)',
  'hsl(142 70% 45%)', 'hsl(48 96% 53%)', 'hsl(210 80% 55%)', 'hsl(280 60% 55%)',
];

const ALERT_COLORS: Record<string, string> = {
  Red: 'hsl(0 72% 51%)',
  Orange: 'hsl(30 95% 55%)',
  Yellow: 'hsl(48 96% 53%)',
  Normal: 'hsl(142 70% 45%)',
};

const adminTabs = ['Emergencies', 'Hospitals', 'Analytics'] as const;

function AdminLogin({ onLogin }: { onLogin: (e: string, p: string) => boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(email, password)) setError('Invalid admin credentials.');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-alert-green" />
          <span className="text-xs font-mono-code text-muted-foreground tracking-widest uppercase">ADMIN</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Password</label>
            <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          {error && <p className="text-sm text-alert-red">{error}</p>}
          <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-colors">Sign In</button>
        </form>
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
          <div className="bg-background border border-border rounded-md p-3 font-mono-code text-sm">
            <p>email: <strong className="text-foreground">admin@lifeline.in</strong></p>
            <p>pass: <strong className="text-foreground">admin123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, adminLogin, hospitals, selectedRegion, emergencyRequests, updateEmergencyStatus } = useApp();
  const [activeTab, setActiveTab] = useState<typeof adminTabs[number]>('Emergencies');
  const [search, setSearch] = useState('');

  if (!isAdmin) return <AdminLogin onLogin={adminLogin} />;

  const regionHospitals = selectedRegion === 'All Regions' ? hospitals : hospitals.filter(h => h.city === selectedRegion);
  const summary = getRegionSummary(regionHospitals);
  const alertCounts = getAlertCounts(regionHospitals);

  const barData = [
    { name: 'ICU Beds', value: regionHospitals.reduce((a, h) => a + (h.resources.icuBeds.total - h.resources.icuBeds.used), 0) },
    { name: 'Ventilators', value: regionHospitals.reduce((a, h) => a + (h.resources.ventilators.total - h.resources.ventilators.used), 0) },
    { name: 'O₂ Beds', value: summary.oxygenBeds },
    { name: 'Ambulances', value: summary.ambulances },
    { name: 'ER Beds', value: regionHospitals.reduce((a, h) => a + (h.resources.erBeds.total - h.resources.erBeds.used), 0) },
    { name: 'Doctors', value: summary.erDoctors },
    { name: 'Patients', value: summary.patients },
  ];

  const pieData = [
    { name: 'Red Alert', value: alertCounts.red },
    { name: 'Orange Alert', value: alertCounts.orange },
    { name: 'Yellow Alert', value: alertCounts.yellow },
    { name: 'Normal', value: alertCounts.normal },
  ].filter(d => d.value > 0);

  const pieColors = pieData.map(d => {
    if (d.name === 'Red Alert') return ALERT_COLORS.Red;
    if (d.name === 'Orange Alert') return ALERT_COLORS.Orange;
    if (d.name === 'Yellow Alert') return ALERT_COLORS.Yellow;
    return ALERT_COLORS.Normal;
  });

  const freqData = regionHospitals.map(h => ({
    name: h.name.split(' ').slice(0, 2).join(' '),
    icuUtil: Math.round((h.resources.icuBeds.used / h.resources.icuBeds.total) * 100),
    ventUtil: Math.round((h.resources.ventilators.used / h.resources.ventilators.total) * 100),
    oxygenLevel: h.resources.oxygenLevel,
  }));

  const filteredHospitals = search ? regionHospitals.filter(h => h.name.toLowerCase().includes(search.toLowerCase())) : regionHospitals;

  const tooltipStyle = { backgroundColor: 'hsl(210 18% 10%)', border: '1px solid hsl(180 30% 18%)', borderRadius: '8px', color: 'hsl(180 100% 95%)' };
  const axisTickStyle = { fill: 'hsl(210 15% 55%)', fontSize: 12 };
  const gridStroke = 'hsl(180 30% 18%)';

  const activeEmergencies = emergencyRequests.filter(r => r.status === 'active').length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-mono-code flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-alert-green animate-pulse-live" />
          <span className="text-alert-green font-semibold">{selectedRegion.toUpperCase()} ADMIN — LIVE DATA</span>
        </p>
        
      </div>

      <div className="flex items-center gap-1">
        {adminTabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={activeTab === t ? 'nav-tab-active' : 'nav-tab'}>
            {t === 'Emergencies' && '⚠ '}{t === 'Hospitals' && '🏥 '}{t === 'Analytics' && '📊 '}
            {t}
            {t === 'Emergencies' && activeEmergencies > 0 && (
              <span className="ml-1 text-[10px] bg-alert-red/20 text-alert-red px-1.5 py-0.5 rounded-full">{activeEmergencies}</span>
            )}
          </button>
        ))}
      </div>

      <StatsRow summary={summary} />

      {activeTab === 'Emergencies' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-alert-red">🔺</span>
            <h3 className="font-semibold">All Emergency Requests — {selectedRegion}</h3>
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{emergencyRequests.length} total</span>
          </div>
          {emergencyRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No emergency requests yet. User SOS requests will appear here.</p>
          ) : (
            <div className="space-y-3">
              {emergencyRequests.map(req => (
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
                    <p className="text-xs text-muted-foreground">🏥 Dispatched to: {req.hospitalName}</p>
                    <p className="text-xs text-muted-foreground">📍 {req.location}</p>
                    {req.mobile && <p className="text-xs text-muted-foreground">📞 {req.mobile}</p>}
                    <p className="text-[10px] text-muted-foreground font-mono-code mt-1">{req.timestamp}</p>
                  </div>
                  {req.status === 'active' && (
                    <button
                      onClick={() => updateEmergencyStatus(req.id, 'resolved')}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-alert-green/10 text-alert-green hover:bg-alert-green/20 transition-colors font-medium shrink-0"
                    >
                      <Check className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Hospitals' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input placeholder={`Search ${selectedRegion} hospitals...`} value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHospitals.map(h => <HospitalCard key={h.id} hospital={h} hideRequest />)}
          </div>
        </div>
      )}

      {activeTab === 'Analytics' && (
        <div className="space-y-6">
          <h3 className="font-semibold flex items-center gap-2">📊 Network Analytics — {selectedRegion}</h3>

          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-xs font-mono-code text-muted-foreground uppercase tracking-wider mb-4">AVAILABLE RESOURCES — BAR CHART</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTickStyle} axisLine={{ stroke: gridStroke }} />
                <YAxis tick={axisTickStyle} axisLine={{ stroke: gridStroke }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-xs font-mono-code text-muted-foreground uppercase tracking-wider mb-4">HOSPITAL ALERT DISTRIBUTION — PIE CHART</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: 'hsl(210 15% 55%)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-xs font-mono-code text-muted-foreground uppercase tracking-wider mb-4">RESOURCE UTILIZATION % — FREQUENCY GRAPH</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={freqData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" tick={{ ...axisTickStyle, fontSize: 10 }} axisLine={{ stroke: gridStroke }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={axisTickStyle} axisLine={{ stroke: gridStroke }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => `${val}%`} />
                  <Area type="monotone" dataKey="icuUtil" name="ICU Utilization" stroke="hsl(0 72% 51%)" fill="hsl(0 72% 51% / 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="ventUtil" name="Ventilator Utilization" stroke="hsl(30 95% 55%)" fill="hsl(30 95% 55% / 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="oxygenLevel" name="Oxygen Level" stroke="hsl(174 72% 46%)" fill="hsl(174 72% 46% / 0.2)" strokeWidth={2} />
                  <Legend wrapperStyle={{ color: 'hsl(210 15% 55%)', fontSize: 12 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
