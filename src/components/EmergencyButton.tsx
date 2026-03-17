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
  const { hospitals } = useApp();

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
    // Find nearest hospital (mock: first Indore hospital with Normal/Yellow alert)
    const nearest = hospitals.find(h => h.city === 'Indore' && h.alertLevel !== 'Red') || hospitals[0];
    setSubmitted(true);
    // In real app, this would dispatch to the nearest hospital
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setName('');
      setMobile('');
    }, 4000);
  };

  return (
    <>
      {/* Emergency FAB - bottom right, above chatbot */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-pulse"
        title="Emergency SOS"
      >
        <AlertTriangle className="w-6 h-6" />
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
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
                <h3 className="font-bold text-lg text-foreground">Emergency Dispatched!</h3>
                <p className="text-sm text-muted-foreground">
                  Nearest hospital has been notified. Ambulance is on its way.<br />
                  <strong>ETA: ~8 minutes</strong>
                </p>
                <p className="text-xs text-muted-foreground">📞 Emergency Helpline: <strong>108</strong></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <p className="text-xs text-muted-foreground">Your emergency will be sent to the nearest available hospital for immediate dispatch.</p>

                {/* Auto Location */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location (Auto-detected)
                  </label>
                  <div className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                    {locating ? 'Detecting your location...' : location}
                  </div>
                </div>

                {/* Name (optional) */}
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

                {/* Mobile (optional) */}
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
                  This alert goes to the nearest hospital in {location.includes('Indore') ? 'Indore' : 'your area'}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
