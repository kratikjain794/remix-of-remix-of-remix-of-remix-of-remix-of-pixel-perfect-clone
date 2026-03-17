import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isEmergency?: boolean;
}

const EMERGENCY_KEYWORDS = ['emergency', 'urgent', 'critical', 'accident', 'bleeding', 'heart attack', 'stroke', 'unconscious', 'not breathing', 'severe pain', 'chest pain'];

const SYMPTOM_MAP: Record<string, { keywords: string[]; resourceType: string; advice: string }> = {
  cardiac: {
    keywords: ['heart', 'chest pain', 'palpitation', 'cardiac'],
    resourceType: 'ICU',
    advice: '**Immediate Steps:**\n1. Sit down and rest immediately\n2. Chew an aspirin if available\n3. Loosen tight clothing\n4. Call **108** if symptoms persist > 5 min',
  },
  respiratory: {
    keywords: ['breathing', 'breath', 'asthma', 'cough', 'respiratory', 'wheeze', 'lung'],
    resourceType: 'Oxygen',
    advice: '**Immediate Steps:**\n1. Sit upright to ease breathing\n2. Use inhaler if prescribed\n3. Avoid allergens/smoke\n4. If SpO₂ < 92%, seek ER immediately',
  },
  fracture: {
    keywords: ['fracture', 'broken bone', 'injury', 'fall', 'sprain', 'ortho'],
    resourceType: 'ER',
    advice: '**Immediate Steps:**\n1. Immobilize the injured area\n2. Apply ice wrapped in cloth\n3. Do NOT try to set the bone\n4. Visit nearest ER with orthopedic care',
  },
  fever: {
    keywords: ['fever', 'temperature', 'flu', 'cold', 'infection', 'viral'],
    resourceType: 'General',
    advice: '**Home Care Tips:**\n1. Rest and stay hydrated\n2. Take paracetamol as per dosage\n3. Use cold compress on forehead\n4. Visit hospital if fever > 103°F for 3+ days',
  },
  gastro: {
    keywords: ['stomach', 'vomit', 'diarrhea', 'nausea', 'food poison', 'abdomen', 'abdominal'],
    resourceType: 'General',
    advice: '**Home Care Tips:**\n1. Stay hydrated with ORS\n2. Avoid solid food for a few hours\n3. Eat bland foods (rice, toast)\n4. Visit hospital if symptoms persist > 24h or blood present',
  },
  pregnancy: {
    keywords: ['pregnant', 'pregnancy', 'delivery', 'labor', 'maternity', 'prenatal'],
    resourceType: 'General',
    advice: '**Important:**\n1. Contact your OB-GYN immediately\n2. If in labor, call **102** (maternal ambulance)\n3. Keep your medical records handy\n4. Visit the nearest hospital with maternity ward',
  },
  blood: {
    keywords: ['blood', 'blood bank', 'transfusion', 'donation'],
    resourceType: 'Blood',
    advice: '**Blood Services:**\n1. Check blood availability at nearby hospitals\n2. Contact hospital blood bank directly\n3. For blood donation, visit nearest blood bank\n4. Blood helpline: **104**',
  },
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: '👋 Hi! I\'m **LifeLine AI**. I can help you find the best hospital based on your symptoms, check bed availability, or guide you in emergencies.\n\nTry telling me your symptoms like "I have chest pain" or "difficulty breathing", or ask about beds, doctors, or ambulances.' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { hospitals } = useApp();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const findHospitalsForSymptom = (resourceType: string) => {
    const suitable = hospitals.filter(h => {
      if (resourceType === 'ICU') return h.resources.icuBeds.total - h.resources.icuBeds.used > 0;
      if (resourceType === 'Oxygen') return h.resources.oxygenLevel > 70;
      if (resourceType === 'ER') return h.resources.erBeds.total - h.resources.erBeds.used > 0;
      if (resourceType === 'Blood') return h.resources.bloodAvailable;
      return h.resources.generalBeds.total - h.resources.generalBeds.used > 0;
    }).sort((a, b) => b.rating - a.rating).slice(0, 3);
    
    if (suitable.length === 0) return '\n\n⚠️ No hospitals with available resources found. Please call **108**.';
    
    let result = '\n\n🏥 **Nearest Recommended Hospitals:**\n';
    suitable.forEach((h, i) => {
      const avail = resourceType === 'ICU' ? `ICU: ${h.resources.icuBeds.total - h.resources.icuBeds.used} beds`
        : resourceType === 'Oxygen' ? `O₂: ${h.resources.oxygenLevel}%`
        : resourceType === 'ER' ? `ER: ${h.resources.erBeds.total - h.resources.erBeds.used} beds`
        : resourceType === 'Blood' ? `Blood: Available`
        : `General: ${h.resources.generalBeds.total - h.resources.generalBeds.used} beds`;
      result += `\n${i + 1}. **${h.name}** — ${h.location}\n   ⭐ ${h.rating} · ${avail} · Alert: ${h.alertLevel}`;
    });
    result += '\n\n💡 *Click "Request" on any hospital card on the Resource Map to book an appointment.*';
    return result;
  };

  const getMockResponse = (input: string): { response: string; isEmergency: boolean } => {
    const lower = input.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(k => lower.includes(k));

    if (isEmergency) {
      return {
        response: `🚨 **EMERGENCY DETECTED!**\n\nIf this is a life-threatening emergency:\n1. **Call 108** immediately\n2. Use the **red SOS button** (bottom-right) to dispatch to nearest registered hospital\n3. Stay calm and follow dispatcher instructions\n\n⚠️ The SOS button dispatches emergencies only to registered hospitals.`,
        isEmergency: true,
      };
    }

    // Check symptoms
    for (const [, symptom] of Object.entries(SYMPTOM_MAP)) {
      if (symptom.keywords.some(k => lower.includes(k))) {
        const hospitalList = findHospitalsForSymptom(symptom.resourceType);
        return {
          response: `🩺 **Based on your symptoms, here's my recommendation:**\n\n${symptom.advice}${hospitalList}`,
          isEmergency: false,
        };
      }
    }

    if (lower.includes('bed') || lower.includes('icu') || lower.includes('ward')) {
      return { response: `🏥 **Current Bed Availability:**\n\n• **ICU Beds:** ${hospitals.reduce((a, h) => a + (h.resources.icuBeds.total - h.resources.icuBeds.used), 0)} available\n• **General Beds:** ${hospitals.reduce((a, h) => a + (h.resources.generalBeds.total - h.resources.generalBeds.used), 0)} available\n• **ER Beds:** ${hospitals.reduce((a, h) => a + (h.resources.erBeds.total - h.resources.erBeds.used), 0)} available\n\n💡 *Check the Resource Map for real-time updates per hospital.*`, isEmergency: false };
    }
    if (lower.includes('doctor') || lower.includes('specialist')) {
      return { response: `👨‍⚕️ **Doctor Availability:**\n\n**${hospitals.reduce((a, h) => a + h.resources.doctors.available, 0)} doctors** currently available.\n\n• For non-emergency consultations, visit the nearest OPD\n• For specialist referrals, contact the hospital reception\n• Telemedicine is available for minor concerns\n\n📞 Helpline: **104**`, isEmergency: false };
    }
    if (lower.includes('ambulance')) {
      return { response: `🚑 **Ambulance Services:**\n\n• **${hospitals.reduce((a, h) => a + h.resources.ambulances.available, 0)} ambulances** currently available\n• Average response time: **8-12 minutes**\n• Call **108** for government ambulance\n• Call **102** for maternal emergencies\n\n💡 Share your exact location for faster dispatch.`, isEmergency: false };
    }
    if (lower.includes('appointment') || lower.includes('book')) {
      return { response: `📋 **How to Book an Appointment:**\n\n1. Go to the **Resource Map** (home page)\n2. Find a hospital with available resources\n3. Click the **"Request"** button on the hospital card\n4. Fill in your details and reason\n5. Track your appointment status on the **User** page\n\n💡 Your appointment will be reviewed by the hospital staff.`, isEmergency: false };
    }
    if (lower.includes('hello') || lower.includes('hi') || lower === 'hey') {
      return { response: `👋 Hello! I'm **LifeLine AI**, your healthcare assistant.\n\nI can help you with:\n• 🩺 **Symptoms** — Tell me your symptoms for hospital recommendations\n• 🏥 **Bed availability** — Ask about ICU, general, or oxygen beds\n• 👨‍⚕️ **Doctors** — Check doctor availability\n• 🚑 **Ambulance** — Get ambulance info\n• 📋 **Appointments** — How to book\n\nWhat do you need help with?`, isEmergency: false };
    }

    return { response: `I'm your healthcare assistant. I can help with:\n\n• 🩺 **Symptom guidance** — Tell me your symptoms (e.g., "chest pain", "breathing difficulty", "fever")\n• 🏥 **Hospital recommendations** — Based on your condition\n• 👨‍⚕️ **Doctor info** — Check availability\n• 🚑 **Ambulance** — Dispatch info\n• 📋 **Appointments** — How to book\n• 🚨 **Emergency** — Say "emergency" for urgent help\n\nHow can I assist you today?`, isEmergency: false };
  };

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { response, isEmergency } = getMockResponse(text);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, isEmergency };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }, [hospitals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, sendMessage]);

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] max-h-[100dvh] sm:max-h-[550px] bg-card border border-border sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-alert-green animate-pulse" />
              <span className="font-semibold text-sm text-foreground">LifeLine AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : msg.isEmergency
                      ? 'bg-[hsl(var(--alert-red)/0.15)] border border-[hsl(var(--alert-red)/0.4)] text-foreground'
                      : 'bg-secondary text-foreground'
                }`}>
                  {msg.isEmergency && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-4 h-4 text-alert-red" />
                      <span className="text-xs font-bold text-alert-red uppercase tracking-wide">Emergency Alert</span>
                    </div>
                  )}
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-xl px-4 py-3 text-sm text-muted-foreground">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border">
            <button
              type="button"
              onClick={toggleVoice}
              className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                isListening
                  ? 'bg-[hsl(var(--alert-red))] text-white animate-pulse'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your message'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Describe your symptoms or ask...'}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isListening}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
