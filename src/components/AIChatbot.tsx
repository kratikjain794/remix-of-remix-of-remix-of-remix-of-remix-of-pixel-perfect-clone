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

const MOCK_RESPONSES: Record<string, string> = {
  emergency: `🚨 **EMERGENCY ALERT RAISED!**\n\nYour emergency has been registered. Here's what to do:\n\n1. **Stay calm** and stay on the line\n2. **Nearest hospital** has been notified\n3. **Ambulance dispatched** — ETA ~8 minutes\n4. If the patient is unconscious, place them in the recovery position\n5. Do NOT move the patient if spinal injury is suspected\n\n📞 Emergency Helpline: **108**`,
  beds: `🏥 **Current Bed Availability:**\n\n• **ICU Beds:** 87 available across network\n• **General Beds:** 340 available\n• **Oxygen Beds:** Based on current O₂ levels\n• **ER Beds:** 15 available\n\n💡 *Tip: Check the Resource Map for real-time updates per hospital.*`,
  doctor: `👨‍⚕️ **Doctor Availability:**\n\nCurrently **36+ doctors** are available across the network.\n\n• For non-emergency consultations, visit the nearest OPD\n• For specialist referrals, contact the hospital reception\n• Telemedicine is available for minor concerns\n\n📞 Helpline: **104** (Health Information)`,
  ambulance: `🚑 **Ambulance Services:**\n\n• **23 ambulances** currently available\n• Average response time: **8-12 minutes**\n• Call **108** for government ambulance\n• Call **102** for maternal emergencies\n\n💡 Share your exact location for faster dispatch.`,
  default: `I'm your healthcare assistant. I can help with:\n\n• 🏥 **Bed availability** — Ask about ICU, general, or oxygen beds\n• 👨‍⚕️ **Doctor info** — Check doctor availability\n• 🚑 **Ambulance** — Request ambulance dispatch info\n• 🚨 **Emergency** — Raise an emergency alert (say "emergency")\n• 💊 **General health** questions\n\nHow can I assist you today?`,
  fever: `🌡️ **Fever Management Tips:**\n\n1. **Rest** and stay hydrated\n2. Take **paracetamol** (as per dosage)\n3. Use a cold compress on forehead\n4. If fever > 103°F for 3+ days, visit ER immediately\n5. Monitor for additional symptoms\n\n⚠️ If accompanied by breathing difficulty, seek emergency care immediately.`,
  oxygen: `💨 **Oxygen Information:**\n\nCurrent network oxygen levels are being monitored in real-time.\n\n• Average O₂ level across hospitals: **~90%+**\n• Hospitals with low O₂ are flagged with Orange/Red alerts\n• For home oxygen needs, contact your nearest hospital\n\n⚠️ If SpO₂ drops below 92%, seek immediate medical attention.`,
  hello: `👋 Hello! I'm **LifeLine AI**, your healthcare assistant.\n\nI can help you with bed availability, doctor info, ambulance services, or raise emergency alerts.\n\nWhat do you need help with?`,
  hi: `👋 Hello! I'm **LifeLine AI**, your healthcare assistant.\n\nI can help you with bed availability, doctor info, ambulance services, or raise emergency alerts.\n\nWhat do you need help with?`,
};

function getMockResponse(input: string): { response: string; isEmergency: boolean } {
  const lower = input.toLowerCase();
  const isEmergency = EMERGENCY_KEYWORDS.some(k => lower.includes(k));

  if (isEmergency) return { response: MOCK_RESPONSES.emergency, isEmergency: true };
  if (lower.includes('bed') || lower.includes('icu') || lower.includes('ward')) return { response: MOCK_RESPONSES.beds, isEmergency: false };
  if (lower.includes('doctor') || lower.includes('specialist')) return { response: MOCK_RESPONSES.doctor, isEmergency: false };
  if (lower.includes('ambulance')) return { response: MOCK_RESPONSES.ambulance, isEmergency: false };
  if (lower.includes('fever') || lower.includes('temperature')) return { response: MOCK_RESPONSES.fever, isEmergency: false };
  if (lower.includes('oxygen') || lower.includes('o2') || lower.includes('spo2')) return { response: MOCK_RESPONSES.oxygen, isEmergency: false };
  if (lower.includes('hello') || lower.includes('hi') || lower === 'hey') return { response: MOCK_RESPONSES.hello, isEmergency: false };
  return { response: MOCK_RESPONSES.default, isEmergency: false };
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: '👋 Hi! I\'m **LifeLine AI**. I can help with hospital info, bed availability, or raise emergencies.\n\nTry saying "emergency" or ask about beds, doctors, or ambulances.' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const { response, isEmergency } = getMockResponse(text);
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, isEmergency };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Web Speech API
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

  // Simple markdown-like rendering
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
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[550px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-alert-green animate-pulse" />
              <span className="font-semibold text-sm text-foreground">LifeLine AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
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

          {/* Input */}
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
              placeholder={isListening ? 'Listening...' : 'Type or speak your message...'}
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