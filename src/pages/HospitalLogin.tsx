import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function HospitalLogin() {
  const { login, signup } = useApp();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Signup fields
  const [hospitalName, setHospitalName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Indore');
  const [hospitalType, setHospitalType] = useState<'Private' | 'Government' | 'Trust'>('Private');
  const [tier, setTier] = useState<'Primary' | 'Secondary' | 'Tertiary' | 'Quaternary'>('Secondary');
  const [icuBeds, setIcuBeds] = useState(10);
  const [generalBeds, setGeneralBeds] = useState(50);
  const [ventilators, setVentilators] = useState(5);
  const [erBeds, setErBeds] = useState(10);
  const [oxygenLevel, setOxygenLevel] = useState(95);
  const [doctors, setDoctors] = useState(5);
  const [ambulances, setAmbulances] = useState(2);
  const [bloodAvailable, setBloodAvailable] = useState(true);

  // Auto-detect location
  useEffect(() => {
    if (tab === 'signup' && !location) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => setLocation(`${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E, Indore`),
        () => setLocation('Indore, MP')
      );
    }
  }, [tab, location]);

  const handleSignin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(email, password)) {
      setError('Invalid credentials. Try the demo credentials below.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!hospitalName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    signup({
      name: hospitalName.trim(),
      email: email.trim(),
      password,
      location: location || 'Indore, MP',
      city,
      type: hospitalType,
      tier,
      icuBeds,
      generalBeds,
      ventilators,
      erBeds,
      oxygenLevel,
      doctors,
      ambulances,
      bloodAvailable,
    });
  };

  const inputCls = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const labelCls = "text-sm text-muted-foreground mb-1 block";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-alert-red" />
          <span className="text-xs font-mono-code text-muted-foreground tracking-widest uppercase">LIFELINE</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-6">{tab === 'signin' ? 'Hospital Staff Login' : 'Register Hospital'}</h2>

        <div className="flex border border-border rounded-lg overflow-hidden mb-6">
          <button onClick={() => { setTab('signin'); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${tab === 'signin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button onClick={() => { setTab('signup'); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${tab === 'signup' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <UserPlus className="w-4 h-4" /> Sign Up
          </button>
        </div>

        {tab === 'signin' ? (
          <form onSubmit={handleSignin} className="space-y-4">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
            </div>
            {error && <p className="text-sm text-alert-red">{error}</p>}
            <button type="submit" className="w-full bg-alert-red hover:bg-alert-red/90 text-foreground font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="bg-background border border-border rounded-md p-3 font-mono-code text-sm">
                <p>email: <strong className="text-foreground">hospital@lifeline.in</strong></p>
                <p>pass: <strong className="text-foreground">hospital123</strong></p>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className={labelCls}>Hospital Name *</label>
              <input placeholder="e.g. City Care Hospital" value={hospitalName} onChange={e => setHospitalName(e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" placeholder="hospital@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Password *</label>
                <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Location (auto-detected)</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className={inputCls} placeholder="Detecting..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>City</label>
                <select value={city} onChange={e => setCity(e.target.value)} className={inputCls}>
                  <option>Indore</option><option>Sagar</option><option>Katni</option><option>Jabalpur</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select value={hospitalType} onChange={e => setHospitalType(e.target.value as any)} className={inputCls}>
                  <option>Private</option><option>Government</option><option>Trust</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Tier</label>
                <select value={tier} onChange={e => setTier(e.target.value as any)} className={inputCls}>
                  <option>Primary</option><option>Secondary</option><option>Tertiary</option><option>Quaternary</option>
                </select>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-sm font-semibold text-foreground mb-3">Resources</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>ICU Beds</label>
                  <input type="number" min={0} value={icuBeds} onChange={e => setIcuBeds(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>General Beds</label>
                  <input type="number" min={0} value={generalBeds} onChange={e => setGeneralBeds(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Ventilators</label>
                  <input type="number" min={0} value={ventilators} onChange={e => setVentilators(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>ER Beds</label>
                  <input type="number" min={0} value={erBeds} onChange={e => setErBeds(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Oxygen Level %</label>
                  <input type="number" min={0} max={100} value={oxygenLevel} onChange={e => setOxygenLevel(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Doctors</label>
                  <input type="number" min={0} value={doctors} onChange={e => setDoctors(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Ambulances</label>
                  <input type="number" min={0} value={ambulances} onChange={e => setAmbulances(+e.target.value)} className={inputCls} />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <input type="checkbox" checked={bloodAvailable} onChange={e => setBloodAvailable(e.target.checked)} className="accent-primary" id="blood" />
                  <label htmlFor="blood" className="text-sm text-muted-foreground">Blood Available</label>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-alert-red">{error}</p>}
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <UserPlus className="w-4 h-4" /> Register Hospital
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
