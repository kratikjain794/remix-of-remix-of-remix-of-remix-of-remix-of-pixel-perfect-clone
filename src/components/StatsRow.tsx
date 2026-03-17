import { AlertTriangle, BedDouble, Wind, Truck, Stethoscope, Heart, Users } from 'lucide-react';
import { RegionSummary } from '@/types/hospital';

interface Props {
  summary: RegionSummary;
}

const statItems = [
  { key: 'activeEmergencies', label: 'ACTIVE EMERGENCIES', icon: AlertTriangle, color: 'text-alert-red' },
  { key: 'icuAvailable', label: 'ICU AVAILABLE', icon: BedDouble, color: 'text-primary' },
  { key: 'ventilators', label: 'VENTILATORS', icon: Wind, color: 'text-primary' },
  { key: 'ambulances', label: 'AMBULANCES', icon: Truck, color: 'text-primary' },
  { key: 'erDoctors', label: 'ER DOCTORS', icon: Stethoscope, color: 'text-alert-yellow' },
  { key: 'oxygenBeds', label: 'OXYGEN BEDS', icon: Heart, color: 'text-primary' },
  { key: 'patients', label: 'PATIENTS', icon: Users, color: 'text-primary' },
] as const;

export default function StatsRow({ summary }: Props) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {statItems.map(item => {
        const Icon = item.icon;
        const value = summary[item.key as keyof RegionSummary];
        return (
          <div key={item.key} className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-[10px] font-mono-code text-muted-foreground uppercase tracking-wider">{item.label}</span>
            </div>
            <span className="text-3xl font-bold text-primary tabular-nums">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
