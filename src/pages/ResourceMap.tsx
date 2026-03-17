import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getRegionSummary, getAlertCounts } from '@/data/hospitals';
import StatsRow from '@/components/StatsRow';
import HospitalCard from '@/components/HospitalCard';
import AIChatbot from '@/components/AIChatbot';
import EmergencyButton from '@/components/EmergencyButton';
import AmbulanceTrackingMap from '@/components/AmbulanceTrackingMap';
import { Search } from 'lucide-react';

const regions = ['All Regions', 'Indore', 'Sagar', 'Katni', 'Jabalpur'];
const filters = ['All', 'ICU', 'ER', 'Ventilator', 'Oxygen', 'Blood'];

export default function ResourceMap() {
  const { hospitals, selectedRegion, setSelectedRegion } = useApp();
  const [search, setSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState('All Alert Levels');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const regionHospitals = useMemo(() => {
    let filtered = selectedRegion === 'All Regions' ? hospitals : hospitals.filter(h => h.city === selectedRegion);
    if (search) filtered = filtered.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));
    if (alertFilter !== 'All Alert Levels') filtered = filtered.filter(h => h.alertLevel === alertFilter);
    if (categoryFilter === 'ICU') filtered = filtered.filter(h => h.resources.icuBeds.total - h.resources.icuBeds.used > 0);
    if (categoryFilter === 'ER') filtered = filtered.filter(h => h.resources.erBeds.total - h.resources.erBeds.used > 0);
    if (categoryFilter === 'Ventilator') filtered = filtered.filter(h => h.resources.ventilators.total - h.resources.ventilators.used > 0);
    if (categoryFilter === 'Oxygen') filtered = filtered.filter(h => h.resources.oxygenLevel > 50);
    if (categoryFilter === 'Blood') filtered = filtered.filter(h => h.resources.bloodAvailable);
    return filtered;
  }, [hospitals, selectedRegion, search, alertFilter, categoryFilter]);

  const summary = getRegionSummary(regionHospitals);
  const alerts = getAlertCounts(selectedRegion === 'All Regions' ? hospitals : hospitals.filter(h => h.city === selectedRegion));

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Region tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {regions.map(r => (
          <button key={r} onClick={() => setSelectedRegion(r)} className={selectedRegion === r ? 'nav-tab-active' : 'nav-tab'}>
            {r === selectedRegion && r !== 'All Regions' && <span className="inline-block w-2 h-2 rounded-full bg-alert-green mr-1.5 animate-pulse-live" />}
            {r}{r !== 'All Regions' && ' (Live)'}
          </button>
        ))}
      </div>

      <StatsRow summary={summary} />

      {/* Alert legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-alert-red" /> {alerts.red} Red</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-alert-orange" /> {alerts.orange} Orange</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-alert-yellow" /> {alerts.yellow} Yellow</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-alert-green" /> {alerts.normal} Normal</span>
        </div>
        <span className="text-sm text-muted-foreground font-mono-code">🏥 {regionHospitals.length} HOSPITALS</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search hospitals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <select value={alertFilter} onChange={e => setAlertFilter(e.target.value)} className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-foreground">
          <option>All Alert Levels</option>
          <option>Red</option>
          <option>Orange</option>
          <option>Yellow</option>
          <option>Normal</option>
        </select>
        {filters.map(f => (
          <button key={f} onClick={() => setCategoryFilter(f)} className={categoryFilter === f ? 'nav-tab-active' : 'nav-tab'}>
            {f === 'All' && '🏥'} {f === 'ICU' && '🛏'} {f === 'ER' && '🏥'} {f === 'Ventilator' && '💨'} {f === 'Oxygen' && '💧'} {f === 'Blood' && '♥'} {f}
          </button>
        ))}
      </div>


      {/* Hospital grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {regionHospitals.map(h => (
          <HospitalCard key={h.id} hospital={h} />
        ))}
      </div>
      {regionHospitals.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No hospitals match your filters.</p>
      )}

      {/* Floating components */}
      <EmergencyButton />
      <AIChatbot />
    </div>
  );
}
