import { useState } from 'react';
import { AlertTriangle, X, MapPin, Phone, User, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('Detecting...');
  const [submitted, setSubmitted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [dispatchedHospital, setDispatchedHospital] = useState('');
  const { hospitals, addEmergencyRequest, getSignedUpHospitals } = useApp();

  const detectLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Indore)`);
          setLocating(false);
        },
        () => {
          setLocation('Indore, MP (Default)');
          setLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setLocation('Indore, MP (Default)');
      setLocating(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSubmitted(false);
    detectLocation();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only dispatch to signed-up hospitals (not hardcoded ones)
    const signedUpHospitals = getSignedUpHospitals();
    
    if (signedUpHospitals.length === 0) {
      setDispatchedHospital('');
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setName('');
        setMobile('');
      }, 4000);
      return;
    }

    // Find nearest signed-up hospital (prefer ones not in Red alert)
    const nearest = signedUpHospitals.find(h => h.alertLevel !== 'Red') || signedUpHospitals[0];
    
    addEmergencyRequest({
      patientName: name.trim() || 'Anonymous',
      mobile: mobile.trim(),
      location,
      targetHospitalId: nearest.id,
      hospitalName: nearest.name,
    });

    setDispatchedHospital(nearest.name);
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setName('');
      setMobile('');
      setDispatchedHospital('');
    }, 4000);
  };

  const signedUpCount = getSignedUpHospitals().length;

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-pulse"
        title="Emergency SOS"
      >
        <AlertTriangle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-destructive/20 border-b border-destructive/30 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="font-bold text-destructive text-sm uppercase tracking-wide">Emergency SOS</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-alert-green/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-alert-green" />
                </div>
                {dispatchedHospital ? (
                  <>
                    <h3 className="font-bold text-lg text-foreground">Emergency Dispatched!</h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>{dispatchedHospital}</strong> has been notified. Ambulance is on its way.<br />
                      <strong>ETA: ~8 minutes</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg text-foreground">No Registered Hospitals</h3>
                    <p className="text-sm text-muted-foreground">
                      No hospitals have signed up yet. Emergency requests are only dispatched to registered hospitals.<br />
                      Please call <strong>108</strong> for immediate help.
                    </p>
                  </>
                )}
                <p className="text-xs text-muted-foreground">📞 Emergency Helpline: <strong>108</strong></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Your emergency will be sent to the nearest registered hospital for immediate dispatch.
                  {signedUpCount === 0 && (
                    <span className="block mt-1 text-alert-yellow">⚠ No hospitals registered yet. A hospital must sign up first to receive emergencies.</span>
                  )}
                  {signedUpCount > 0 && (
                    <span className="block mt-1 text-alert-green">✓ {signedUpCount} registered hospital(s) available</span>
                  )}
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location (Auto-detected)
                  </label>
                  <div className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                    {locating ? 'Detecting your location...' : location}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Mobile No. (Optional)
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-destructive text-destructive-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  DISPATCH EMERGENCY
                </button>

                <p className="text-[10px] text-center text-muted-foreground">
                  This alert goes to the nearest registered hospital
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
