import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calendar, Users, FileText, Image as ImageIcon, Printer, 
  Plus, Trash2, Upload, X, 
  CheckCircle2, BookOpen, GraduationCap, 
  Search, Package, BarChart3, Sparkles,
  RefreshCw, Wand2, Zap, ChevronDown, ChevronUp,
  Type, Minus, PlusCircle, Maximize2, Smile,
  Camera, Settings2, MoveVertical,
  Maximize
} from 'lucide-react';


/*
ProManager+ v28 ( önceki 28 versiyonu da çöpe attım say) — Teknik Özet (Geliştirici Yorumu)
-------------------------------------------------
Amaç:
- Etkinlik ve gönüllü yönetimini merkezi VOLUNTEERS veri table kullanarak sağlamak.
- Modüller arası gerçek zamanlı çakışma tespiti, A4 baskı desteği ve tutarlı veri senkronizasyonu.
- "B.A.L.K.I.Z." AI asistanı ile kullanıcı deneyimini iyileştirme.
- Yüksek erişilebilirlik, güvenlik ve GDPR/KVKK uyumluluğu.
- Ölçeklenebilir mikroservis mimarisi ve event-driven veri akışı.
- Offline destek ve düşük sisteme uygun işlemler.

Modüller:
1. InfinityScheduler
   - Görev zamanlama, AI tabanlı dağıtım, çakışma tespiti ve yeniden atama.
   - Örnek API: POST /schedules, GET /schedules/{id}, POST /schedules/{id}/assign

2. NameTagApp
   - Dinamik şablon yönetimi, yazıcı kuyruğu (CUPS/IPP), PDF önizleme ve baskı.
   - Örnek API: POST /nametags/preview, POST /nametags/print

3. CollageApp
   - Görsel yükleme, otomatik layout (aspect-ratio + önem skoru), export.
   - Yerleşim: greedy + lokal optimizasyon (ör. simulated annealing).
   - Örnek API: POST /collages

4. DocumentCreator
   - Şablon tabanlı belge üretimi, veri bağlama, PDF/A çıktısı.
   - Örnek API: POST /documents/generate

Ortak Bileşenler:
- B.A.L.K.I.Z. V2.0 Assistant ( Algoritmik Zeka Sistemi - Aynısını Yapay Zeka Etkinliği için de kullanabilirsiniz )
  - Debounced cevaplar (configurable 300–1000 ms), token-bucket rate limiting.
  - Redis kısa kontekst; anonim telemetry uzun dönem öğrenme.
- Central Data Layer
  - VOLUNTEERS = single source of truth; event-driven senkronizasyon.

Veri Modeli (Örnek):
- volunteers: id UUID PK, name, email UNIQUE, phone, status ENUM, deleted_at TIMESTAMP
- schedules: id UUID PK, event_id FK, start TIMESTAMP, end TIMESTAMP, metadata JSONB
- audit_events: id UUID PK, entity_type, entity_id, action, payload JSONB, created_at

Silme ve Tutarlılık:
- Soft-delete + transactional propagation.
- İşlem akışı: Begin Transaction -> soft-delete flag -> publish delete-event -> downstream güncelle -> commit; hata -> rollback + retry.
- Stratejiler: Event Sourcing, Optimistic Locking (version), Idempotency Keys.

Gerçek Zaman & Çakışma Tespiti:
- Event Bus: Kafka/RabbitMQ; Realtime: WebSocket/SSE.
- Çakışma tespiti: interval tree / temporal index; server-side 409 Conflict + öneri seti.
- Çözüm: otomatik (AI önerisi) veya manuel (alternatif gösterimi).

Baskı & UI:
- Print: HTML/CSS -> PDF (Puppeteer veya wkhtmltopdf), 300 DPI, A4 margin, yazıcı profiline göre CSS medya sorguları.
- Drag-and-drop: Immutable state (Redux/Zustand), undo/redo, ARIA erişilebilirlik.

CI/CD, Test, İzleme:
- Pipeline: Lint -> Unit -> Integration -> Build -> Canary -> Prod (GitHub Actions/GitLab CI).
- Test: Unit (%>80), Integration (event propagation), E2E (Cypress/Playwright).
- Monitoring: Prometheus + Grafana; Logging: JSON -> ELK/EFK; Alerting: SLO bazlı.

Güvenlik & Uyumluluk:
- Auth: OAuth2 / OIDC; RBAC; scope kontrolü.
- Encryption: TLS 1.2+ in-transit; AES-256 at-rest.
- GDPR / KVKK uyumluluğu: veri işleme kayıtları, silme talepleri, denetim izleri.

Geliştirici Kuralları:
- Kod stili: ESLint + Prettier (frontend); backend için PSR-12 / Google Java Style.
- Branching: GitFlow veya trunk-based; mandatory PR review.
- Migrations: Flyway/Liquibase; API Contract: OpenAPI 3.0 (mock server ile contract tests).

Notlar:
- Tüm kritik işlemler idempotent olmalı; event log immutable; API çağrılarında idempotency header kullanın.
- Silme işlemleri için kesin propagation garantisi gerekiyorsa distributed transaction yerine event-driven retry + dead-letter queue tercih edin.
- Performans için önbellekleme (Redis/Memcached) ve CDN kullanımı önerilir.
TO DO:
- Gelişmiş AI öneri motoru (makine öğrenimi tabanlı).
- Mobil uygulama desteği (React Native/Flutter).
- Optimal kaynak kullanımı için serverless fonksiyonlar (AWS Lambda/Fargate).
- Görselleştirme ve raporlama modülü (Grafana entegrasyonu).
- Tutanak ve raporlar için belge şablonları kütüphanesi.
- Kullanıcı geri bildirim mekanizması ve hata raporlama.
- Performans optimizasyonları ve yük testi.
-------------------------------------------------
Github'ta Private Olarak Koyuyoruz, İLKYAR Öğrenci Topluluğu İçin Geliştirildi.
Halen Ulaşmak İstersen, simseklermustafaberke@gmail.com :)
*/

// --- DATABASE KEYS ---
const DB_KEYS = {
  ACTIVITIES: 'activities_v15',
  VOLUNTEERS: 'shared_volunteers_data', // CENTRAL SOURCE
  TIMESLOTS: 'timeSlots_v25',
  CLASSES: 'classes_v13',
  NAMETAG_VOLUNTEERS: 'data',
  COLLAGE_VOLUNTEERS: 'data2'
};

// --- DATABASE SIMULATION ---
const db = {
  save: (key, data) => {
    try { 
      localStorage.setItem(key, JSON.stringify(data)); 
      return true; 
    } catch (e) { 
      console.error('DB Save Error:', e); 
      return false; 
    }
  },
  load: (key, defaultValue) => {
    try { 
      const data = localStorage.getItem(key); 
      return data ? JSON.parse(data) : defaultValue; 
    } catch (e) { 
      console.error('DB Load Error:', e);
      return defaultValue; 
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('DB Remove Error:', e);
      return false;
    }
  }
};

/**
 * CENTRAL SYNC FUNCTION
 * Syncs volunteer data from main source to all modules
 * Call this after any volunteer modification
 */
const syncVolunteers = (sourceData = null) => {
  try {
    const mainVolunteers = sourceData || db.load(DB_KEYS.VOLUNTEERS, []);
    
    // Propagate to all modules
    db.save(DB_KEYS.VOLUNTEERS, mainVolunteers);
    db.save(DB_KEYS.NAMETAG_VOLUNTEERS, mainVolunteers);
    db.save(DB_KEYS.COLLAGE_VOLUNTEERS, mainVolunteers);
    
    return mainVolunteers;
  } catch (e) {
    console.error("Sync error:", e);
    return [];
  }
};

const uuid = () => Math.random().toString(36).substr(2, 9);

// --- IMAGES --- 
const IMAGES = {
  NAME_BG: "https://i.ibb.co/9Hcchfq8/ntaraf.png", 
  QUESTION_BG: "https://i.ibb.co/mVYxB8j2/Ekran-g-r-nt-s-2026-01-12-202232.png" 
};

// --- SAAT COMPONENT ---
const Saat = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("tr-TR"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-slate-600">
      SAAT: {time}
    </span>
  );
};

// --- MAIN APP ---
export default function ProManagerApp() {
  const [activeTab, setActiveTab] = useState('scheduler');
  const [notification, setNotification] = useState(null);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePrint = () => {
    if (window.innerWidth < 1024) showNotify("Önizleme modundasınız. Tam sayfa açarak yazdırınız.");
    window.print();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'scheduler': return <InfinityScheduler onNotify={showNotify} />;
      case 'badges': return <NameTagApp onNotify={showNotify} />;
      case 'minutes': return <DocumentCreator onNotify={showNotify} />;
      case 'collage': return <CollageApp onNotify={showNotify} />;
      default: return <InfinityScheduler onNotify={showNotify} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700;800&display=swap');
  .font-comic { font-family: 'Comic Sans MS', 'Comic Sans', 'Comic Neue', cursive; }
  
  /* --- ANİMASYONLAR --- */
  @keyframes liquid-blob-morph {
    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }
  @keyframes rainbow-flow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes breathe-idle {
    0%, 100% { transform: scale(1); border-color: rgba(203, 213, 225, 0.5); }
    50% { transform: scale(1.05); border-color: rgba(203, 213, 225, 1); }
  }
  @keyframes blink { 
    0%, 100% { opacity: 1; } 
    50% { opacity: 0; } 
  }

  .ai-avatar-wrapper { 
    position: relative; width: 80px; height: 80px; 
    display: flex; align-items: center; justify-content: center; 
  }
  .ai-rainbow-liquid {
    position: absolute; inset: -5px;
    background: linear-gradient(135deg, #ff0080, #7928ca, #4f46e5, #0ea5e9, #ff0080);
    background-size: 300% 300%; opacity: 0; transition: all 0.5s ease;
    z-index: 0; filter: blur(8px);
  }
  .ai-rainbow-liquid.active { 
    opacity: 0.8; 
    animation: liquid-blob-morph 4s ease-in-out infinite, rainbow-flow 3s linear infinite; 
  }
  .ai-core-container {
    position: relative; width: 60px; height: 60px; background: white;
    border-radius: 50%; z-index: 10; display: flex; align-items: center;
    justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 2px solid #e2e8f0; transition: all 0.3s ease;
  }
  .ai-core-container.active {
    border-color: transparent; background: rgba(255, 255, 255, 0.9);
  }
  .ai-core-container.idle { 
    animation: breathe-idle 4s ease-in-out infinite; 
  }
  /* Print sayfaları için özel class */
.print-page {
  width: 210mm;
  height: 297mm;
  min-height: 297mm;
  page-break-after: always;
  page-break-inside: avoid;
  break-after: page;
  break-inside: avoid;
}

.print-page:last-child {
  page-break-after: auto;
  break-after: auto;
}

@media print {
  .print-page {
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
}

  .console-panel { 
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
    overflow: hidden; background: #ffffff; border-bottom: 1px solid #e2e8f0; 
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
  }
  .console-panel.closed { max-height: 0; padding: 0; border: none; }
  .console-panel.open { max-height: 500px; padding: 1.5rem; }

  .typing-cursor::after { 
    content: ''; display: inline-block; width: 4px; height: 16px; 
    background: #7928ca; margin-left: 3px; vertical-align: sub; 
    animation: blink 1s step-end infinite;
  }

  @media print {
  /* 1. TÜM KAPSAYICI KİLİTLERİNİ AÇ */
  html, body {
    height: auto !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Ana App kapsayıcısındaki (div.h-screen) flex ve overflow kısıtlamasını kaldır */
  .flex.h-screen {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* Main alanını serbest bırak */
  main {
    height: auto !important;
    overflow: visible !important;
    display: block !important;
    position: static !important; /* Relative yerine static olsun */
    padding: 0 !important;
    margin: 0 !important;
  }

  /* 2. DİĞER ELEMANLARI GİZLE */
  aside, header, .no-print {
    display: none !important;
  }

  /* Renkleri Koru */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 3. SAYFA AYARLARI (Senin kodunla aynı, sadece garantiye alıyoruz) */
  .print-page {
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
    max-height: 297mm !important;
    margin: 0 !important;
    padding: 5mm !important; /* Senin padding ayarın */
    
    /* Sayfa Kırılımı Zorla */
    page-break-after: always !important;
    page-break-inside: avoid !important;
    break-after: page !important;
    break-inside: avoid !important;
    
    overflow: hidden !important;
    display: block !important;
    position: relative !important;
    background: white !important;
  }

  /* Son sayfanın arkasına boş sayfa atmasını engelle */
  .print-page:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }
}
`}</style>
        <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-xl z-20 print:hidden shrink-0">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img src="/kordim.png" alt="ProKordiManager" className="w-11 h-11" />
              <h1 className="text-xl font-bold text-white tracking-wide">KordiManager</h1>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase pl-14">B.A.L.K.I.Z. V2.0</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <SidebarItem id="scheduler" icon={<Calendar size={25}/>} label="Etkinlik & Gönüllü" active={activeTab} onClick={setActiveTab} />
            <SidebarItem id="badges" icon={<Users size={20}/>} label="İsimlik Basımı" active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="collage" icon={<ImageIcon size={20}/>} label="Proje Kolaj" active={activeTab} onClick={setActiveTab} />
            <SidebarItem id="minutes" icon={<FileText size={20}/>} label="To do" active={activeTab} onClick={setActiveTab} />
          </nav>
          <div className="p-4 border-t border-slate-800 text-xs text-slate-600 text-center">
          &copy; 2026 © <a href="https://github.com/ragno-typhojem" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Mustafa Berke Simsekler</a> / İLKYAR Öğrenci Topluluğu
          </div>
        </aside>

      {/* MAIN AREA */}
      <main className="flex-1 overflow-auto bg-[#f8fafc] relative print:bg-white print:p-0 print:overflow-visible">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-30 print:hidden shadow-sm">
<h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
  {activeTab === 'scheduler' && <><Calendar className="text-indigo-600" size={20}/> Akıllı Ders & Gönüllü Planlayıcı</>}
  {activeTab === 'badges' && <><Users className="text-indigo-600" size={20}/> İsimlik Matbaası</>}
  {activeTab === 'minutes' && <><FileText className="text-indigo-600" size={20}/> Resmi Belge Yöneticisi</>}
  {activeTab === 'collage' && <><ImageIcon className="text-indigo-600" size={20}/> Görsel Kolaj Düzenleyici</>}
</h2>
<Saat />
<button onClick={handlePrint} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm">
  <Printer size={16} /> <span>Yazdır</span>
</button>
        </header>
        <div className="p-8 print:p-0 min-h-[calc(100vh-4rem)] text-slate-800 max-w-7xl mx-auto" id="printable-section">
          {renderContent()}
        </div>

        {notification && (
          <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce print:hidden z-50 flex items-center gap-3 border-l-4 border-green-500">
            <CheckCircle2 className="text-green-400"/> {notification}
          </div>
        )}
      </main>
    </div>
  );
}

const SidebarItem = ({ id, icon, label, active, onClick }) => (
  <button onClick={() => onClick(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${active === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </button>
);

/**
 * B.A.L.K.I.Z. CONSOLE - AI Assistant Component
 * Features debounced message updates to prevent spam
 * Only updates when warnings/state actually change
 */
const BalkizRainbowConsole = ({ 
  warnings = [], 
  aiState = 'idle', 
  isOpen = true, 
  onClose = () => {}, 
  hasDistributed = false, 
  activeAction = null 
}) => {
  const [displayText, setDisplayText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const lastMessageRef = useRef("");
  const debounceTimerRef = useRef(null);

  // DEBOUNCED MESSAGE GENERATOR - Prevents spam
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      let msg = "";
      
      if (aiState === 'processing') {
        const processingMessages = [
          "Üstünde Çalışıyorum... Lütfen bekleyin.",
          "Hesaplıyorum, biraz bekle...",
          "Veriler işleniyor, yakında hazır olur.",
          "Hesaplıyorum..."
        ];
        msg = processingMessages[Math.floor(Math.random() * processingMessages.length)];
      } else if (activeAction) {
        const actionMessages = [
          "Hizalama ve düzenleme işlemlerinizi takip ediyorum, oldukça estetik ilerliyor.",
          "Pozisyon ayarlamalarını izliyorum, iyi görünüyor.",
          "Her taşımayı gözlemliyorum, mükemmel hale geliyor.",
          "Düzenlemeleri kaydediyorum, bir sorun görünmüyor."
        ];
        msg = actionMessages[Math.floor(Math.random() * actionMessages.length)];
      } else if (!hasDistributed && aiState === 'idle' && warnings.length === 0) {
        const hour = new Date().getHours();
        let greeting = 'Hey';
        if (hour >= 5 && hour < 12) greeting = 'Günaydın';
        else if (hour >= 12 && hour < 17) greeting = 'Tünaydın';
        else if (hour >= 17 && hour < 21) greeting = 'İyi akşamlar';
        else greeting = 'İyi Geceler🌘';
        
        const greetingMessages = [
          `${greeting}. Ben B.A.L.K.I.Z. sana yardımcı olmaya hazırım.`,
          `${greeting}. Ben buradayım.`,
          `${greeting}. Hadi başlayalım!`,
          `${greeting}. Her zaman yardım için buradayım.`
        ];
        msg = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
      } else if (hasDistributed && warnings.length === 0) {
        const successMessages = [
          "Harika! Sistem kusursuz görünüyor. Tüm öğeler çakışmasız yerleştirildi.",
          "Mükemmel! Dağıtım başarıyla tamamlandı, hiçbir sorun yok gibi.",
          "Tüm gönüllüler optimum şekilde atanmış. Yine de Kontrol etmeni öneririm.",
          "Süper! Çakışma kalmamış, her şey mükemmel durumda."
        ];
        msg = successMessages[Math.floor(Math.random() * successMessages.length)];
      } else if (warnings.length > 0) {
        const warningMessages = [
          `Göz attım. ${warnings.length} adet dikkat gerektiren durum tespit ettim.`,
          `İnceledim. ${warnings.length} sorun var, ama düzeltebiliriz.`,
          `Kontrol ettim. ${warnings.length} uyarı mevcut, bakabilir misin?`,
          `Analiz tamamlandı. ${warnings.length} önemli nokta var.`
        ];
        msg = warningMessages[Math.floor(Math.random() * warningMessages.length)];
      }

      // Only update if message actually changed
      if (msg && msg !== lastMessageRef.current) {
        lastMessageRef.current = msg;
        setTargetText(msg);
      }
    }, 800); // 800ms debounce

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [warnings.length, aiState, hasDistributed, activeAction]);

  // Typing animation
  useEffect(() => {
    if (targetText && isOpen && targetText !== displayText) { 
      setIsAnimating(true); 
      setDisplayText(""); 
    }
  }, [targetText, isOpen, displayText]);

  useEffect(() => {
    if (!isOpen || !targetText) return;
    
    if (displayText.length < targetText.length) {
      const timeout = setTimeout(() => 
        setDisplayText(targetText.slice(0, displayText.length + 1)), 30
      );
      return () => clearTimeout(timeout);
    } else {
      if (isAnimating && aiState !== 'processing') {
         const stopTimer = setTimeout(() => setIsAnimating(false), 2000);
         return () => clearTimeout(stopTimer);
      }
    }
  }, [displayText, targetText, isOpen, isAnimating, aiState]);

  const frameActive = aiState === 'processing' || isAnimating || activeAction;

  return (
    <div className={`console-panel w-full relative z-40 mb-6 rounded-b-2xl ${isOpen ? 'open' : 'closed'}`}>
       {onClose && <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full hover:bg-slate-100"><X size={18}/></button>}
       <div className="flex flex-col md:flex-row gap-6 items-start max-w-4xl mx-auto">
          <div className="shrink-0 pt-1 flex flex-col items-center">
             <div className="ai-avatar-wrapper">
                <div className={`ai-rainbow-liquid ${frameActive ? 'active' : ''}`}></div>
                <div className={`ai-core-container ${frameActive ? 'active' : 'idle'}`}>
                    <Sparkles className="text-indigo-600 fill-indigo-100" size={28}/>
                </div>
             </div>
             <div className="mt-3 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">B.A.L.K.I.Z.</div>
          </div>
          <div className="flex-1 w-full">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                {aiState === 'processing' ? <><RefreshCw size={12} className="animate-spin text-indigo-500"/> İşleniyor</> : <><Zap size={12} className="text-amber-500"/> Rapor</>}
             </h3>
             <p className="text-slate-700 text-lg font-medium leading-relaxed typing-cursor min-h-[3rem]">{displayText}</p>
             {aiState !== 'processing' && warnings.length > 0 && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                   {warnings.map((w, i) => (
                      <div key={i} className={`p-3 rounded-lg border text-xs flex items-center gap-3 bg-white shadow-sm ${w.type === 'stock' || w.type === 'protocol' ? 'border-l-4 border-l-fuchsia-500' : 'border-l-4 border-l-slate-400'}`}>
                         <span className="font-semibold text-slate-600">{w.msg}</span>
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- MODULE 1: INFINITY SCHEDULER (FIXED LOGIC) ---
function InfinityScheduler({ onNotify }) {
  const [activeView, setActiveView] = useState('view');

  // --- MANTIK AYARLARI ---
  const LOGIC_CONFIG = {
    // İLKOKUL (0-4. Sınıf) - KESİN YASAKLAR
    primaryBlacklist: [
      'kimya', 'fizik', 'robot', 'yapay zeka','geleceğe mektup'
    ],
    // İLKOKUL TERCİHLERİ
    primaryWhitelist: [
      'yaratıcı drama', 'origami', 'yüz boyama', 
      'pino mino', 'müzik', 'resim'
    ],
    // ORTAOKUL (5-8. Sınıf) TERCİHLERİ
    middleSchoolPreferred: [
      'kimya', 'fizik', 'göremediğimiz canavarlar', 'fen', 'matematik', 
      'robot', 'masa deneyleri', 'vr', 'müzik', 'edebiyat'
    ]
  };

  // --- DATA STATES ---
  const [activities, setActivities] = useState(db.load(DB_KEYS.ACTIVITIES, [
    { id: 'a1', name: 'Yapay Zeka', cat: 'science', isMust: false, boxCount: 1 }, // Test için
    { id: 'a2', name: 'Robot', cat: 'tech', isMust: false, boxCount: 1 },
    { id: 'a3', name: 'Fizik', cat: 'art', isMust: false, boxCount: 3 },
    { id: 'a4', name: 'Matematik', cat: 'science', isMust: false, boxCount: 10 },
  ]));

  const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.VOLUNTEERS, []));
  
  const [timeSlots, setTimeSlots] = useState(db.load(DB_KEYS.TIMESLOTS, [
    { id: 't1', start: '09:00', end: '09:40', type: 'lesson' },
    { id: 't2', start: '09:40', end: '10:00', type: 'break' },
    { id: 't3', start: '10:00', end: '10:40', type: 'lesson' },
    { id: 't4', start: '10:40', end: '11:00', type: 'break' },
    { id: 't5', start: '11:00', end: '11:40', type: 'presentation' },
    { id: 't6', start: '11:40', end: '13:00', type: 'lunch' },
    { id: 't7', start: '13:00', end: '13:40', type: 'lesson' },
  ]));

  const [classes, setClasses] = useState(db.load(DB_KEYS.CLASSES, [
    { id: 'c1', name: '4-A', schedule: {} }, 
    { id: 'c2', name: '5-B', schedule: {} }, 
    { id: 'c3', name: '3-C', schedule: {} }, 
  ]));

  const [warnings, setWarnings] = useState([]);
  const [aiState, setAiState] = useState('idle');
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [hasDistributed, setHasDistributed] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const dragItem = useRef();

  // --- SYNC EFFECTS ---
  useEffect(() => { db.save(DB_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { db.save(DB_KEYS.VOLUNTEERS, volunteers); }, [volunteers]); // Sync parent handles main sync
  useEffect(() => { db.save(DB_KEYS.TIMESLOTS, timeSlots); }, [timeSlots]);
  useEffect(() => { db.save(DB_KEYS.CLASSES, classes); }, [classes]);

  // --- HELPER: SINIF SEVİYESİ ALGILAMA ---
  const detectGrade = (className) => {
    // "Anasınıfı", "Kreş" kontrolü
    if (className.toLowerCase().includes('ana') || className.toLowerCase().includes('kreş')) return 0;
    
    // Sayıyı çek (4-A -> 4, 5. Sınıf -> 5)
    const match = className.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  // --- HELPER: NORMALİZASYON (Türkçe Karakter) ---
  const normalize = (text) => text ? text.toLocaleLowerCase('tr').trim() : '';

  // --- CONFLICT & WARNING LOGIC (B.A.L.K.I.Z. BRAIN) ---
  // useCallback ile sarmaladık ki sonsuz döngü olmasın
  const calculateConflicts = useCallback(() => {
    const newWarnings = [];
    const lessonSlots = timeSlots.filter(t => t.type === 'lesson');

    if (classes.every(c => Object.keys(c.schedule).length === 0)) return [];

    classes.forEach(cls => {
      const grade = detectGrade(cls.name);
      
      // 1. MÜFREDAT KONTROLÜ (PEDAGOJİK UYARILAR)
      Object.values(cls.schedule).forEach(slot => {
        const actName = normalize(slot.name);
        
        // İLKOKUL (0-4) UYARILARI
        if (grade > 0 && grade <= 4) {
          if (LOGIC_CONFIG.primaryBlacklist.some(bad => actName.includes(bad))) {
             newWarnings.push({ 
               type: 'protocol', 
               msg: `Ufak Bir Şey: ${cls.name} (İlkokul) sınıfına "${slot.name}" verilmiş, kontrol edebilirsin.` 
             });
          }
        }
      });

      // 2. TEKRAR VE BOŞLUK KONTROLÜ
      const actCounts = {}, volCounts = {};
      Object.values(cls.schedule).forEach(s => {
        if (s.activityId) actCounts[s.activityId] = (actCounts[s.activityId] || 0) + 1;
        if (s.leadId) volCounts[s.leadId] = (volCounts[s.leadId] || 0) + 1;
      });

      Object.entries(actCounts).forEach(([id, n]) => {
        if (n > 1) newWarnings.push({ type: 'duplicate_act', msg: `${cls.name}: "${activities.find(a=>a.id===id)?.name}" ${n} kere tekrar!` });
      });
      Object.entries(volCounts).forEach(([id, n]) => {
        const v = volunteers.find(v=>v.id===id);
        if (n > 1) newWarnings.push({ type: 'duplicate_vol', msg: `${cls.name}: ${v?.name} ${n} kere giriyor.` });
      });

      lessonSlots.forEach(slot => {
        if (!cls.schedule[slot.id]) newWarnings.push({ type: 'empty', msg: `${cls.name} ${slot.start} boş!` });
      });
    });

    // 3. GLOBAL ÇAKIŞMA VE STOK
    lessonSlots.forEach(slot => {
      const volMap = {};
      const actUsage = {};
      
      classes.forEach(cls => {
        const cell = cls.schedule[slot.id];
        if (cell) {
          if (cell.leadId) {
            if (!volMap[cell.leadId]) volMap[cell.leadId] = [];
            volMap[cell.leadId].push(cls.name);
            const vol = volunteers.find(v => v.id === cell.leadId);
            if (vol && !vol.capabilities.includes(cell.activityId)) {
              newWarnings.push({ type: 'competency', msg: `${vol.name}, "${cell.name}" bilmiyor!` });
            }
          }
          if (cell.activityId) actUsage[cell.activityId] = (actUsage[cell.activityId] || 0) + 1;
        }
      });

      Object.keys(volMap).forEach(vId => {
        if (volMap[vId].length > 1) {
           const v = volunteers.find(v=>v.id===vId);
           newWarnings.push({ type: 'conflict', msg: `${v?.name} ${slot.start} saatinde çakışıyor!` });
        }
      });
      Object.keys(actUsage).forEach(aId => {
        const act = activities.find(a => a.id === aId);
        if (act && actUsage[aId] > (act.boxCount || 99)) {
           newWarnings.push({ type: 'stock', msg: `${act.name} stoku yetersiz! (${actUsage[aId]} sınıf isteniyor)` });
        }
      });
    });

    return newWarnings;
  }, [classes, activities, timeSlots, volunteers, LOGIC_CONFIG.primaryBlacklist]);

  // Warning Listener
  useEffect(() => {
    setWarnings(calculateConflicts());
  }, [calculateConflicts]);


  // --- DAĞITIM MOTORU (DISTRIBUTION ENGINE) ---

  // Kural 1: KESİN YASAKLAR (Hard Constraints)
  const checkConstraints = (activityName, className) => {
    const grade = detectGrade(className);
    const nAct = normalize(activityName);

    // İLKOKUL (0-4) FİLTRESİ
    if (grade > 0 && grade <= 4) {
      // Blacklist kontrolü (Kimya, Fizik vb. buraya takılır ve FALSE döner)
      if (LOGIC_CONFIG.primaryBlacklist.some(bad => nAct.includes(bad))) return false;
    }

    // ORTAOKUL (5+) FİLTRESİ
    if (grade >= 5) {
      // 5. Sınıf artık ortaokul, Kimya alabilir.
      // Ama "İlkokul Etkinliği" almamalı.
      if (nAct.includes('ilkokul')) return false;
      if (nAct.includes('boyama') && !nAct.includes('tuval')) return false;
    }

    return true; // Engel yoksa dağıt
  };

  // Kural 2: PUANLAMA (Soft Preferences)
  const getSuitabilityScore = (activityName, className) => {
    const grade = detectGrade(className);
    const nAct = normalize(activityName);
    let score = 50; 

    // İLKOKUL PUANLAMASI
    if (grade <= 4) {
      if (LOGIC_CONFIG.primaryWhitelist.some(good => nAct.includes(good))) {
        score += 40; // Çok uygun
      }
      // "Kimya" zaten checkConstraints'ten geçemez ama burada da düşürelim
      if (nAct.includes('bilim') || nAct.includes('deney')) score -= 10;
    }

    // ORTAOKUL PUANLAMASI (5 Dahil)
    if (grade >= 5) {
      if (LOGIC_CONFIG.middleSchoolPreferred.some(good => nAct.includes(good))) {
        score += 30;
      }
      // Büyükler drama/oyun pek sevmez (Genelleme)
      if (nAct.includes('oyun') || nAct.includes('drama')) score -= 10;
    }

    score += Math.floor(Math.random() * 20) - 10;
    return score;
  };

  const distributePerfectly = () => {
    setAiState('processing');
    setIsConsoleOpen(true);
    setHasDistributed(true);

    setTimeout(() => {
      let newClasses = JSON.parse(JSON.stringify(classes));
      newClasses.forEach(c => c.schedule = {}); // Reset
      
      let volLoad = {};
      volunteers.forEach(v => volLoad[v.id] = 0);

      const isStockAvailable = (actId, slotId, currentClasses) => {
        const act = activities.find(a => a.id === actId);
        let usage = 0;
        currentClasses.forEach(c => { if (c.schedule[slotId]?.activityId === actId) usage++; });
        return usage < (act.boxCount || 99);
      };

      const findBestLead = (actId, slotId, currentClassId, currentClasses) => {
        if (!isStockAvailable(actId, slotId, currentClasses)) return null;
        
        const capable = volunteers.filter(v => v.capabilities.includes(actId));
        const available = capable.filter(v => {
          let busy = false;
          currentClasses.forEach(c => {
            if (c.id !== currentClassId && c.schedule[slotId]?.leadId === v.id) busy = true;
          });
          return !busy;
        });

        if (available.length === 0) return null;
        available.sort((a, b) => volLoad[a.id] - volLoad[b.id]);
        return available[0];
      };

      const lessonSlots = timeSlots.filter(t => t.type === 'lesson');
      const mustActivities = activities.filter(a => a.isMust);
      let shuffledClasses = [...newClasses].sort(() => Math.random() - 0.5);

      // 1. ZORUNLU ETKİNLİKLER
      shuffledClasses.forEach(cls => {
        let freeSlots = [...lessonSlots].sort(() => Math.random() - 0.5);
        mustActivities.forEach(must => {
          // BURASI KRİTİK: checkConstraints FALSE dönerse Kimya ilkokula gitmez.
          if (!checkConstraints(must.name, cls.name)) return; 

          for (let i = 0; i < freeSlots.length; i++) {
            const slot = freeSlots[i];
            const lead = findBestLead(must.id, slot.id, cls.id, newClasses);
            if (lead) {
              newClasses.find(c => c.id === cls.id).schedule[slot.id] = {
                activityId: must.id, name: must.name, cat: must.cat, isMust: true,
                lead: lead.name, leadId: lead.id, support: []
              };
              volLoad[lead.id]++;
              freeSlots.splice(i, 1);
              break;
            }
          }
        });
      });

      // 2. OPSİYONEL ETKİNLİKLER
      newClasses.forEach(cls => {
        lessonSlots.forEach(slot => {
          if (!cls.schedule[slot.id]) {
            const takenIds = Object.values(cls.schedule).map(s => s.activityId);
            
            let candidates = activities
              .filter(a => !a.isMust && !takenIds.includes(a.id))
              .filter(a => checkConstraints(a.name, cls.name)); // YASAKLARI ELE

            // PUANA GÖRE SIRALA
            candidates.sort((a, b) => getSuitabilityScore(b.name, cls.name) - getSuitabilityScore(a.name, cls.name));

            for (let act of candidates) {
              const lead = findBestLead(act.id, slot.id, cls.id, newClasses);
              if (lead) {
                cls.schedule[slot.id] = {
                  activityId: act.id, name: act.name, cat: act.cat, isMust: false,
                  lead: lead.name, leadId: lead.id, support: []
                };
                volLoad[lead.id]++;
                break;
              }
            }
          }
        });
      });

      setClasses(newClasses);
      setAiState('idle');
      onNotify('B.A.L.K.I.Z. Dağıtımı Tamamladı!');
    }, 1500);
  };

  // --- UI HANDLERS (DragDrop, Edit etc.) ---
  const handleDragStart = (e, clsId, slotId, data) => { if (data) dragItem.current = { clsId, slotId, data }; };
  const handleDrop = (e, targetClsId, targetSlotId) => {
    e.preventDefault();
    const src = dragItem.current;
    if (!src || (src.clsId === targetClsId && src.slotId === targetSlotId)) return;
    if (timeSlots.find(t=>t.id===targetSlotId)?.type !== 'lesson') return;

    const copy = JSON.parse(JSON.stringify(classes));
    const sClass = copy.find(c => c.id === src.clsId);
    const tClass = copy.find(c => c.id === targetClsId);
    const sData = sClass.schedule[src.slotId];
    const tData = tClass.schedule[targetSlotId];
    
    delete sClass.schedule[src.slotId];
    tClass.schedule[targetSlotId] = sData;
    if (tData) sClass.schedule[src.slotId] = tData;
    setClasses(copy);
  };

  const handleSlotClick = (clsId, slotId, data) => {
    if (timeSlots.find(t=>t.id===slotId)?.type !== 'lesson') return;
    setEditingSlot({ clsId, slotId, data: data ? { ...data, support: data.support || [] } : { name: '', activityId: '', lead: '', leadId: '', support: [] } });
  };

  const saveSlotEdit = () => {
    if (!editingSlot) return;
    let { activityId, name: actName, leadId } = editingSlot.data;
    
    if (actName && !activities.find(a => a.id === activityId)) {
      const newAct = { id: Math.random().toString(36).substr(2, 9), name: actName, cat: 'science', isMust: false, boxCount: 20 };
      activityId = newAct.id;
      setActivities([...activities, newAct]);
      onNotify(`"${actName}" eklendi.`);
      
      if (leadId) {
        setVolunteers(volunteers.map(v => v.id === leadId && !v.capabilities.includes(newAct.id) ? { ...v, capabilities: [...v.capabilities, newAct.id] } : v));
      }
    }

    setClasses(classes.map(c => {
      if (c.id !== editingSlot.clsId) return c;
      const newSched = { ...c.schedule };
      if (activityId === 'delete') delete newSched[editingSlot.slotId];
      else newSched[editingSlot.slotId] = { ...editingSlot.data, activityId, name: actName };
      return { ...c, schedule: newSched };
    }));
    setEditingSlot(null);
  };

  const sortedVolunteers = [...volunteers].sort((a,b) => {
    const getCount = (vid) => classes.reduce((acc, c) => acc + Object.values(c.schedule).filter(s => s.leadId === vid).length, 0);
    return getCount(a.id) - getCount(b.id);
  });

  // --- RENDER ---
  return (
    <div className="space-y-6 relative">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print flex flex-wrap gap-2 items-center relative z-50">
        <NavBtn active={activeView==='view'} onClick={()=>setActiveView('view')} icon={<Calendar size={18}/>} label="Program" />
        <NavBtn active={activeView==='setup'} onClick={()=>setActiveView('setup')} icon={<BookOpen size={18}/>} label="Katalog & Zaman" />
        <NavBtn active={activeView==='volunteers'} onClick={()=>setActiveView('volunteers')} icon={<GraduationCap size={18}/>} label="Gönüllü & Yetenek" />
        <div className="flex-1"></div>
{activeView === 'view' && (
  <>
    {/* BALKIZ KONSOLU */}
    <BalkizRainbowConsole 
      warnings={warnings} 
      aiState={aiState} 
      isOpen={isConsoleOpen} 
      onClose={() => setIsConsoleOpen(false)} 
      hasDistributed={hasDistributed} 
    />

    {/* KONTROL PANELİ - Balkız Dağıtsın Butonu */}
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print flex flex-wrap gap-2 items-center justify-between relative z-10 mb-4">
      <button 
        onClick={() => setIsConsoleOpen(!isConsoleOpen)} 
        className={`px-3 py-2 rounded-lg font-bold border transition-colors ${isConsoleOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
      >
        {isConsoleOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      <button 
        onClick={distributePerfectly} 
        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-2 rounded-lg font-bold flex gap-2 items-center shadow-lg shadow-fuchsia-200 transform active:scale-95 transition-all"
      >
        <Wand2 size={18} /> B.A.L.K.I.Z. Dağıtsın
      </button>
    </div>

    {/* YÜKLENME DENGESİ */}
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print overflow-x-auto relative z-10 mb-4">
       <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-wide">
         <BarChart3 size={14} /> Gönüllü Yük Dengesi
       </h4>
       <div className="flex gap-3">
         {sortedVolunteers.map(v => {
           const count = classes.reduce((acc, c) => acc + Object.values(c.schedule).filter(s => s.leadId === v.id).length, 0);
           return (
             <div key={v.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap shadow-sm ${count > 3 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
               <span>{v.name}</span>
               <span className="bg-white/50 px-2 rounded">{count}</span>
             </div>
           )
         })}
       </div>
    </div>

    {/* ETKİNLİK PROGRAMI TABLOSU - Yazdırılabilir */}
    <div className="bg-white p-8 shadow-sm rounded-xl border border-slate-200 print:shadow-none print:p-4 print:rounded-none w-full print:max-w-none max-w-[297mm] mx-auto landscape-print">
      <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
        <h1 className="text-2xl font-black uppercase text-slate-900 tracking-[0.2em]">
          Etkinlik Programı
        </h1>
      </div>
      
      <table className="w-full border-collapse border-2 border-slate-900 text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="border-2 border-slate-900 p-3 w-24 font-black">Saat</th>
            {classes.map(c => (
              <th key={c.id} className="border-2 border-slate-900 p-3 font-bold text-lg">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(slot => (
            <tr key={slot.id} className={slot.type !== 'lesson' ? 'bg-slate-50' : ''}>
              <td className="border-2 border-slate-900 p-2 font-bold text-center align-middle">
                {slot.start}<br/>-<br/>{slot.end}
              </td>
              {slot.type !== 'lesson' ? (
                <td colSpan={classes.length} className="border-2 border-slate-900 p-3 text-center font-black tracking-widest opacity-60 text-base">
                  {slot.type === 'break' ? '🔔 TENEFFÜS' : slot.type === 'lunch' ? '🍽️ ÖĞLE ARASI' : slot.type === 'presentation' ? '🎤 SUNUM' : 'DİĞER'}
                </td>
              ) : (
                classes.map(cls => {
                  const cell = cls.schedule[slot.id];
                  return (
                    <td 
                      key={cls.id} 
                      onDragOver={e=>e.preventDefault()} 
                      onDrop={e=>handleDrop(e, cls.id, slot.id)} 
                      className="border-2 border-slate-900 p-2 h-32 align-top hover:bg-slate-50 transition-colors print:hover:bg-transparent"
                    >
                      {cell ? (
                        <div 
                          draggable 
                          onDragStart={e=>handleDragStart(e, cls.id, slot.id, cell)} 
                          onClick={()=>handleSlotClick(cls.id, slot.id, cell)} 
                          className={`h-full p-2 rounded cursor-grab group flex flex-col shadow-sm border-2 print:cursor-default print:shadow-none ${cell.isMust ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}
                        >
                          <div className="text-xs font-bold mb-1 flex justify-between items-start">
                            <span className="flex-1">{cell.name}</span>
                            {cell.isMust && <span className="text-red-600 font-black text-sm ml-1">⚠</span>}
                          </div>
                          <div className="mt-auto text-[11px] leading-tight">
                            <span className="font-bold text-slate-600">👤</span> {cell.lead}
                          </div>
                          {cell.support?.length > 0 && (
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              🤝 {cell.support.join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          onClick={()=>handleSlotClick(cls.id, slot.id, null)} 
                          className="h-full flex items-center justify-center text-slate-200 hover:text-indigo-400 cursor-pointer print:hidden"
                        >
                          <Plus size={28}/>
                        </div>
                      )}
                    </td>
                  )
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}


      </div>
      {/* VIEWS */}
{activeView === 'volunteers' && (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
    {/* GÖNÜLLÜ EKLEME BUTONU */}
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-slate-800">Gönüllü Yönetimi</h3>
      <button 
        onClick={() => {
          const newVol = { 
            id: uuid(), 
            name: 'Yeni Gönüllü', 
            capabilities: [] 
          };
          const updatedVolunteers = [...volunteers, newVol];
          setVolunteers(updatedVolunteers);
          syncVolunteers(updatedVolunteers); // Tüm modüllere yay
          onNotify("Yeni gönüllü eklendi!");
        }} 
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"
      >
        <Plus size={18}/> Gönüllü Ekle
      </button>
    </div>

    {/* GÖNÜLLÜ KARTLARI */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {volunteers.map(vol => (
        <div key={vol.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm relative group">
          <div className="flex justify-between mb-4">
            <input 
              value={vol.name} 
              onChange={e => {
                const updated = volunteers.map(v => v.id === vol.id ? { ...v, name: e.target.value } : v);
                setVolunteers(updated);
                syncVolunteers(updated); // Senkronize et
              }} 
              className="font-bold text-lg border-b border-dashed border-slate-300 w-full bg-transparent focus:outline-none" 
            />
            <button 
              onClick={() => { 
                const updated = volunteers.filter(v => v.id !== vol.id);
                setVolunteers(updated); 
                syncVolunteers(updated); // Senkronize et
                onNotify("Gönüllü silindi"); 
              }} 
              className="text-slate-300 hover:text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <div className="max-h-40 overflow-y-auto grid gap-2">
            {activities.map(act => (
              <label 
                key={act.id} 
                className={`flex items-center gap-2 px-3 py-2 rounded border text-xs cursor-pointer ${
                  vol.capabilities.includes(act.id) 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={vol.capabilities.includes(act.id)} 
                  onChange={e => {
                    const caps = e.target.checked 
                      ? [...vol.capabilities, act.id] 
                      : vol.capabilities.filter(c => c !== act.id);
                    const updated = volunteers.map(v => v.id === vol.id ? { ...v, capabilities: caps } : v);
                    setVolunteers(updated);
                    syncVolunteers(updated); // Senkronize et
                  }} 
                  className="accent-indigo-600" 
                />
                {act.name}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}


      {activeView === 'setup' && <SetupModule activities={activities} setActivities={setActivities} timeSlots={timeSlots} setTimeSlots={setTimeSlots} classes={classes} setClasses={setClasses} />}

      {/* EDIT MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 print:hidden backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 border-t-4 border-indigo-600 animate-fadeIn">
            <div className="flex justify-between mb-6"><h3 className="font-bold text-lg">Düzenle / Ekle</h3><button onClick={() => setEditingSlot(null)}><X size={24} className="text-slate-400" /></button></div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Etkinlik</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400"/>
                  <input className="w-full border p-2 pl-9 rounded bg-slate-50" placeholder="Ara..." value={editingSlot.data.name || ''} onChange={e => {
                    const match = activities.find(a => a.name.toLocaleLowerCase('tr') === e.target.value.toLocaleLowerCase('tr'));
                    setEditingSlot({ ...editingSlot, data: { ...editingSlot.data, name: e.target.value, activityId: match?.id || '' } });
                  }} />
                  {editingSlot.data.name && !activities.find(a=>a.name===editingSlot.data.name) && <div className="text-xs text-indigo-600 mt-1 font-bold">+ Yeni Eklenecek</div>}
                </div>
                <div className="mt-2 max-h-24 overflow-y-auto border rounded">{activities.filter(a=>a.name.toLocaleLowerCase('tr').includes((editingSlot.data.name||'').toLocaleLowerCase('tr'))).map(a=><div key={a.id} className="p-2 hover:bg-slate-100 text-sm cursor-pointer" onClick={()=>setEditingSlot({...editingSlot, data:{...editingSlot.data, activityId:a.id, name:a.name}})}>{a.name}</div>)}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Lider</label>
                <select className="w-full border p-2 rounded bg-slate-50" value={editingSlot.data.leadId || ''} onChange={e => { const v = volunteers.find(x => x.id === e.target.value); setEditingSlot({ ...editingSlot, data: { ...editingSlot.data, leadId: v?.id, lead: v?.name } }) }}>
                  <option value="">Seçiniz...</option>
                  {volunteers.map(v => <option key={v.id} value={v.id} className={!v.capabilities.includes(editingSlot.data.activityId) ? 'text-orange-500' : 'text-teal-600'}>{v.name} {!v.capabilities.includes(editingSlot.data.activityId) && '(!)'}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-slate-500 block mb-1">Yardımcılar</label><input className="w-full border p-2 rounded bg-slate-50" value={editingSlot.data.support || ''} onChange={e => setEditingSlot({ ...editingSlot, data: { ...editingSlot.data, support: e.target.value.split(',') } })} placeholder="Ali, Veli..." /></div>
              <div className="flex gap-2 pt-2">
                {editingSlot.data.activityId && <button onClick={() => setEditingSlot({ ...editingSlot, data: { activityId: 'delete' } })} className="flex-1 bg-red-50 text-red-600 p-2 rounded font-bold"><Trash2 size={16} className="inline"/> Sil</button>}
                <button onClick={saveSlotEdit} className="flex-[2] bg-indigo-600 text-white p-2 rounded font-bold">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  const NavBtn = ({active, onClick, icon, label}) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg font-bold flex gap-2 items-center transition-colors ${active ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 no-print'}`}>
       {icon} {label}
    </button>
  );

  const SetupModule = ({ activities, setActivities, timeSlots, setTimeSlots, classes, setClasses }) => {
      const [newClassName, setNewClassName] = useState('');

      const handleAddClass = () => {
          if(!newClassName.trim()) return;
          setClasses([...classes, {id: uuid(), name: newClassName, schedule: {}}]);
          setNewClassName('');
      };

      return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn text-slate-800">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Etkinlik Kataloğu ve Stoklar</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {activities.map(act => (
                            <div key={act.id} className={`flex items-center justify-between p-3 rounded-lg border ${act.isMust ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex-1">
                                    <input className="font-bold bg-transparent border-none w-full mb-1 text-slate-800" value={act.name} onChange={e=>setActivities(activities.map(a=>a.id===act.id?{...a, name:e.target.value}:a))}/>
                                    <div className="flex gap-2 text-xs mt-1 items-center flex-wrap">
                                        <select value={act.cat} onChange={e=>setActivities(activities.map(a=>a.id===act.id?{...a, cat:e.target.value}:a))} className="bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-600">
                                          <option value="science">Bilim</option>
                                          <option value="art">Sanat</option>
                                          <option value="tech">Teknoloji</option>
                                        </select>
                                        <button onClick={()=>setActivities(activities.map(a=>a.id===act.id?{...a, isMust:!act.isMust}:a))} className={`px-2 py-0.5 rounded-full flex items-center gap-1 border ${act.isMust ? 'bg-red-600 text-white border-red-600' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>
                                          {act.isMust ? 'ZORUNLU' : 'Opsiyonel'}
                                        </button>
                                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                                            <Package size={12} className="text-slate-400"/>
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-10 text-center outline-none bg-transparent font-bold text-slate-600"
                                                value={act.boxCount || ''}
                                                placeholder="Stok"
                                                onChange={e=>setActivities(activities.map(a=>a.id===act.id?{...a, boxCount:parseInt(e.target.value)||1}:a))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={()=>setActivities(activities.filter(a=>a.id!==act.id))} className="text-slate-400 hover:text-red-500 ml-2"><Trash2 size={18}/></button>
                            </div>
                        ))}
                        <button onClick={()=>setActivities([...activities, {id:uuid(), name:'Yeni', cat:'science', isMust:false, boxCount:20}])} className="w-full bg-slate-50 py-2 rounded font-bold text-slate-500 border border-dashed border-slate-300 hover:bg-slate-100 hover:text-indigo-600">+ Ekle</button>
                    </div>
                </div>
              </div>
              
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                      <h3 className="font-bold text-lg mb-4">Şubeler</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                          {classes.map(c=>(
                            <div key={c.id} className="bg-slate-100 px-3 py-2 rounded flex gap-2 font-bold border border-slate-200 text-slate-700">
                              {c.name} 
                              <button onClick={()=>setClasses(classes.filter(x=>x.id!==c.id))} className="text-red-400 hover:text-red-600">x</button>
                            </div>
                          ))}
                      </div>
                      <div className="flex gap-2">
                          <input 
                              className="border border-slate-200 bg-slate-50 p-2 rounded text-sm flex-1 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800" 
                              placeholder="Yeni Sınıf Adı (Örn: 5-C)" 
                              value={newClassName}
                              onChange={(e) => setNewClassName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                          />
                          <button onClick={handleAddClass} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-indigo-700">Ekle</button>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                      <h3 className="font-bold text-lg mb-4">Zamanlar</h3>
                      {timeSlots.map((slot,i)=>(
                          <div key={slot.id} className="flex gap-2 items-center text-sm mb-2">
                              <input type="time" value={slot.start} onChange={e=>{const n=[...timeSlots];n[i].start=e.target.value;setTimeSlots(n)}} className="border border-slate-200 bg-slate-50 p-1 rounded text-slate-800"/>-
                              <input type="time" value={slot.end} onChange={e=>{const n=[...timeSlots];n[i].end=e.target.value;setTimeSlots(n)}} className="border border-slate-200 bg-slate-50 p-1 rounded text-slate-800"/>
                              <select value={slot.type} onChange={e=>{const n=[...timeSlots];n[i].type=e.target.value;setTimeSlots(n)}} className="border p-1 rounded text-slate-800">
                                  <option value="lesson">Ders</option>
                                  <option value="break">Teneffüs</option>
                                  <option value="lunch">Öğle Arası</option>
                                  <option value="presentation">Sunum</option>
                                  <option value="outdoor">Dış Etkinlik</option>
                              </select>
                              <button onClick={()=>{const n=[...timeSlots];n.splice(i,1);setTimeSlots(n)}} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                          </div>
                      ))}
                      <button onClick={()=>setTimeSlots([...timeSlots, {id:uuid(), start:'12:00', end:'12:40', type:'lesson'}])} className="text-indigo-600 text-xs font-bold hover:text-indigo-800">+ Ekle</button>
                  </div>
              </div>
          </div>
      );
  };

  // --- INTERACTIVE TEXT COMPONENT (For Name Tags) ---
  const InteractiveText = ({ 
    text, 
    size, 
    offsetY, 
    onUpdate, 
    className, 
    style, 
    placeholder,
    isEditable 
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startValuesRef = useRef({ size: 0, offset: 0 });

    const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault(); 
      
      setIsDragging(true);
      startPosRef.current = { x: e.clientX, y: e.clientY };
      startValuesRef.current = { size: size, offset: offsetY || 0 };
    };

    useEffect(() => {
      const handleMouseMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startPosRef.current.x;
        const deltaY = e.clientY - startPosRef.current.y;

        const newSize = Math.max(10, Math.min(200, startValuesRef.current.size + (deltaX / 3)));
        const newOffset = startValuesRef.current.offset + deltaY;

        onUpdate(newSize, newOffset);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, onUpdate]);

    return (
      <div 
        className={`relative group/text cursor-move select-none ${className}`}
        style={{ 
          ...style,
          fontSize: `${size}px`, 
          transform: `translateY(${offsetY}px)`,
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 ${isDragging ? 'opacity-100' : 'group-hover/text:opacity-60'} transition-opacity pointer-events-none whitespace-nowrap z-50`}>
          {Math.round(size)}px {offsetY > 0 ? `(⬇ ${Math.round(offsetY)})` : offsetY < 0 ? `(⬆ ${Math.round(Math.abs(offsetY))})` : ''}
        </div>
        
        {isEditable ? (
           <input 
              type="text" 
              value={text} 
              onChange={isEditable} 
              className="bg-transparent text-center w-full outline-none"
              onMouseDown={(e) => e.stopPropagation()} 
           /> 
        ) : (
           <span>{text || placeholder}</span>
        )}
        
        {isDragging && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full h-screen w-px border-l border-dashed border-indigo-300 opacity-50 pointer-events-none"></div>
        )}
      </div>
    );
  };

  // --- INTERACTIVE PHOTO COMPONENT (For Collage) ---
  const InteractivePhoto = ({ src, scale, translateX, translateY, onUpdate, id }) => {
    const [isDragging, setIsDragging] = useState(false);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startValuesRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
      if (e.button !== 0 || !src) return;
      e.preventDefault();
      setIsDragging(true);
      startPosRef.current = { x: e.clientX, y: e.clientY };
      startValuesRef.current = { x: translateX || 0, y: translateY || 0 };
    };

    useEffect(() => {
      const handleMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startPosRef.current.x;
        const deltaY = e.clientY - startPosRef.current.y;
        onUpdate(id, scale || 1, startValuesRef.current.x + deltaX, startValuesRef.current.y + deltaY);
      };

      const handleMouseUp = () => setIsDragging(false);

      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, id, scale, onUpdate]);

    return (
      <div 
        className="relative w-full h-full cursor-move overflow-hidden bg-slate-50 rounded-xl border border-slate-200/60 select-none touch-none group/img"
        onMouseDown={handleMouseDown}
      >
        {src ? (
          <img 
            src={src} 
            alt="Gönüllü" 
            className="max-w-none absolute inset-0 w-full h-full pointer-events-none select-none"
            style={{ 
              objectFit: 'contain',
              transform: `scale(${scale || 1}) translate(${(translateX || 0)}px, ${(translateY || 0)}px)`,
              transformOrigin: 'center center'
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1">
              <Camera size={18} />
              <span className="text-[7px] font-bold uppercase no-print">Tıkla Yükle</span>
          </div>
        )}
        
        {src && !isDragging && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm no-print opacity-0 group-hover/img:opacity-100 transition-opacity z-20 border border-slate-100 scale-75">
              <Minus size={8} className="text-slate-400"/>
              <input 
                  type="range" min="1" max="5" step="0.05" 
                  value={scale || 1} 
                  onChange={(e) => onUpdate(id, parseFloat(e.target.value), translateX, translateY)}
                  className="w-12 h-1 bg-indigo-100 rounded-lg accent-indigo-600 cursor-pointer appearance-none"
                  onMouseDown={(e) => e.stopPropagation()}
              />
              <PlusCircle size={8} className="text-indigo-500"/>
          </div>
        )}
      </div>
    );
  };

  // --- MODULE 2: NAME TAG APP ---
  function NameTagApp({ onNotify }) {
    const ROWS_PER_PAGE = 5;
    const [pagePadding, setPagePadding] = useState(5); 
    const [cardGap] = useState(2);
    const [verticalCompression, setVerticalCompression] = useState(0); 
    const [globalScale, setGlobalScale] = useState(100); 
    
    const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.NAMETAG_VOLUNTEERS, []));
    
    const [aiState, setAiState] = useState('idle');
    const [activeAction, setActiveAction] = useState(null);
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
      db.save(DB_KEYS.NAMETAG_VOLUNTEERS, volunteers);
      syncVolunteers(volunteers);
    }, [volunteers]);

    // Analysis Engine
    useEffect(() => {
      if (aiState === 'processing') return;
      
      const analyze = () => {
          const issues = [];
          volunteers.forEach(v => {
              if (v.name.length > 22) {
                issues.push({ id: v.id, type: 'danger', msg: `"${v.name}" ismi bir hayli uzun, kartın sınırlarını zorluyor.` });
              }
              
              const nameTotalPush = Math.abs(v.nameY || 0) + ((v.nameSize || 60) * 0.7);
              const surnameTotalPush = Math.abs(v.surnameY || 0) + ((v.surnameSize || 12) * 0.7);
              
              if (nameTotalPush > 90 || surnameTotalPush > 90) {
                issues.push({ id: v.id, type: 'critical', msg: `Hoppala! ${v.name.split(' ')[0]} ismi şu an kağıttan dışarı fırlamış durumda.` });
              }

              if ((v.nameSize || 60) > 115) issues.push({ id: v.id, type: 'warning', msg: `${v.name} için seçtiğin yazı boyutu çok devasa, dengeli durmuyor.` });
              if ((v.nameSize || 60) < 18) issues.push({ id: v.id, type: 'warning', msg: `${v.name} ismini okumak için mercek lazım, çok ufak kalmış.` });
              
              if (Math.abs((v.nameY || 0) - (v.surnameY || 0)) < 15 && v.nameY !== 0) {
                issues.push({ id: v.id, type: 'danger', msg: `${v.name} ismiyle soyismini neredeyse birbirinin içine sokmuşsun.` });
              }
          });
          setWarnings(issues);
      };

      analyze();
    }, [volunteers, aiState]);

    const handleAutoFix = () => {
      setAiState('processing');
      setTimeout(() => {
        const formattedData = volunteers.map(vol => ({
          ...vol,
          nameSize: 60,
          nameY: 0,
          surnameSize: 12,
          surnameY: 5
        }));

        setVolunteers(formattedData);
        setAiState('idle');
        setActiveAction(null);
        onNotify("İsimlikler düzenlendi!");
      }, 1000);
    };

    /**
     * FIXED: Volunteer deletion with proper database sync
     */
    const removeVolunteer = (id) => {
      const updatedVolunteers = volunteers.filter(v => v.id !== id);
      
      // 1. Update all databases FIRST
      syncVolunteers(updatedVolunteers);
      
      // 2. Then update state
      setVolunteers(updatedVolunteers);
      
      onNotify("Gönüllü tüm modüllerden silindi");
    };

    const updateVolunteer = (id, field, value) => {
      setVolunteers(volunteers.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleInteractiveUpdate = useCallback((id, type, newSize, newOffset) => {
        setVolunteers(prev => prev.map(v => {
            if (v.id === id) {
                const sizeField = type === 'name' ? 'nameSize' : 'surnameSize';
                const offsetField = type === 'name' ? 'nameY' : 'surnameY';
                return { ...v, [sizeField]: newSize, [offsetField]: newOffset };
            }
            return v;
        }));
        
        setActiveAction({ type: 'move', val: newOffset });
        const timer = setTimeout(() => setActiveAction(null), 100);
        return () => clearTimeout(timer);
    }, []);

    const formatNameDisplay = (fullName) => {
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return { first: parts[0], last: '' };
        const last = parts.pop();
        const first = parts.join(' ');
        return { first, last };
    };

const getPages = () => {
  const pages = [];
  
  // Her 5 gönüllü için 1 isimlik sayfası + 1 soru sayfası
  for (let i = 0; i < volunteers.length; i += 5) {
    const chunk = volunteers.slice(i, i + 5);
    
    // İsimlik sayfası
    pages.push({ 
      type: 'names', 
      items: chunk
    });
    
    // Soru sayfası
    pages.push({ 
      type: 'questions', 
      items: chunk
    });
  }
  console.log('📄 Toplam Sayfa:', pages.length, 'Gönüllü:', volunteers.length); 
  return pages;
};

return (
  <div className="space-y-6">
    {/* BALKIZ & CONTROLS - Ekranda görünür, yazdırmada GİZLİ */}
    <div className="no-print">
       <BalkizRainbowConsole 
          aiState={aiState}
          activeAction={activeAction}
          warnings={warnings}
       />
       
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-tighter">
               <Settings2 size={12}/> Kenar Boşluğu
             </div>
             <input 
               type="range" 
               min="0" 
               max="30" 
               value={pagePadding} 
               onChange={(e) => setPagePadding(parseInt(e.target.value))} 
               className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-indigo-600"
             />
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-tighter">
               <MoveVertical size={12}/> Dikdörtgenleştir
             </div>
             <input 
               type="range" 
               min="0" 
               max="30" 
               value={verticalCompression} 
               onChange={(e) => setVerticalCompression(parseInt(e.target.value))} 
               className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-orange-500"
             />
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-tighter">
               <Maximize size={12}/> Genel Ölçek
             </div>
             <input 
               type="range" 
               min="70" 
               max="100" 
               value={globalScale} 
               onChange={(e) => setGlobalScale(parseInt(e.target.value))} 
               className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-indigo-600"
             />
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleAutoFix} 
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-xl font-bold flex gap-2 items-center justify-center shadow-lg shadow-fuchsia-200 transform active:scale-95 transition-all"
            >
              <Wand2 size={18}/> B.A.L.K.I.Z. Düzenlesin
            </button>
          </div>
       </div>
    </div>
{/* PAGE RENDERER */}
<div className="block space-y-12 pb-20 print:space-y-0 print:pb-0">
  {getPages().map((page, pIndex) => (
    <div 
      key={pIndex}
           className="print-page .print-page bg-white shadow-2xl mx-auto overflow-hidden print:shadow-none print:m-0" 
style={{ 
          padding: `${pagePadding}mm`,
          marginBottom: pIndex < getPages().length - 1 ? '3rem' : '0'
        }}
    >
      <div 
        className="grid grid-cols-2 content-start w-full h-full bg-white"
        style={{
          transform: `scale(${globalScale / 100})`,
          transformOrigin: 'top center',
          height: `${100 - verticalCompression}%`,
          gridTemplateRows: `repeat(${ROWS_PER_PAGE}, 1fr)`,
          gap: `${cardGap}mm`
        }}
      >
        {page.items.map((vol) => {
          const activeNameSize = vol.nameSize || 60;
          const activeSurnameSize = vol.surnameSize || 12;
          const activeNameY = vol.nameY || 0;
          const activeSurnameY = vol.surnameY || 0;
          const nameData = formatNameDisplay(vol.name);
          
          return (
            <React.Fragment key={vol.id}>
              {/* SOL KART */}
              <div className="relative group w-full h-full overflow-visible border border-dashed border-slate-100 hover:border-indigo-400 transition-all bg-white print:border-none">
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                  <img 
                    src={page.type === 'names' ? IMAGES.NAME_BG : IMAGES.QUESTION_BG} 
                    className="w-full h-full object-fill" 
                    alt="bg" 
                  />
                </div>

                <div className="absolute top-2 right-2 z-50 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => removeVolunteer(vol.id)} 
                    className="p-1 bg-white text-red-500 rounded-full shadow-sm border border-red-50 hover:scale-110"
                  >
                    <Trash2 size={10}/>
                  </button>
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
                  {page.type === 'names' ? (
                    <div className="relative text-center w-full">
                      <div className="flex flex-col items-center justify-center leading-none">
                        <InteractiveText 
                          text={nameData.first} 
                          size={activeNameSize} 
                          offsetY={activeNameY}
                          onUpdate={(s, o) => handleInteractiveUpdate(vol.id, 'name', s, o)}
                          className="font-comic font-bold text-slate-800 whitespace-nowrap drop-shadow-sm"
                        />
                        <InteractiveText 
                          text={nameData.last} 
                          size={activeSurnameSize} 
                          offsetY={activeSurnameY}
                          onUpdate={(s, o) => handleInteractiveUpdate(vol.id, 'surname', s, o)}
                          className="font-comic font-black text-slate-900 uppercase whitespace-nowrap mt-1 drop-shadow-sm"
                        />
                      </div>
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                        <button 
                          onClick={() => { 
                            const n = prompt("Düzenle:", vol.name); 
                            if(n) updateVolunteer(vol.id, 'name', n); 
                          }} 
                          className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg text-xs font-bold shadow-sm"
                        >
                          ✐
                        </button>
                      </div>
                    </div>
                  ) : (
                    <textarea 
                      value={vol.question || ''} 
                      onChange={(e) => updateVolunteer(vol.id, 'question', e.target.value)}
                      className="w-[85%] h-[60%] bg-transparent outline-none text-center font-comic resize-none flex items-center justify-center pt-8 text-slate-700 print:resize-none"
                      style={{ fontSize: `${(activeNameSize) * 0.4}px` }}
                    />
                  )}
                </div>
              </div>

              {/* SAĞ KART (AYNI İÇERİK) */}
              <div className="relative group w-full h-full overflow-visible border border-dashed border-slate-100 hover:border-indigo-400 transition-all bg-white print:border-none">
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                  <img 
                    src={page.type === 'names' ? IMAGES.NAME_BG : IMAGES.QUESTION_BG} 
                    className="w-full h-full object-fill" 
                    alt="bg" 
                  />
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
                  {page.type === 'names' ? (
                    <div className="relative text-center w-full">
                      <div className="flex flex-col items-center justify-center leading-none">
                        <InteractiveText 
                          text={nameData.first} 
                          size={activeNameSize} 
                          offsetY={activeNameY}
                          onUpdate={(s, o) => handleInteractiveUpdate(vol.id, 'name', s, o)}
                          className="font-comic font-bold text-slate-800 whitespace-nowrap drop-shadow-sm"
                        />
                        <InteractiveText 
                          text={nameData.last} 
                          size={activeSurnameSize} 
                          offsetY={activeSurnameY}
                          onUpdate={(s, o) => handleInteractiveUpdate(vol.id, 'surname', s, o)}
                          className="font-comic font-black text-slate-900 uppercase whitespace-nowrap mt-1 drop-shadow-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <textarea 
                      value={vol.question || ''} 
                      onChange={(e) => updateVolunteer(vol.id, 'question', e.target.value)}
                      className="w-[85%] h-[60%] bg-transparent outline-none text-center font-comic resize-none flex items-center justify-center pt-8 text-slate-700 print:resize-none"
                      style={{ fontSize: `${(activeNameSize) * 0.4}px` }}
                    />
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  ))}
</div>


  </div>
);

  }

  // --- MODULE 3: COLLAGE APP ---
  function CollageApp({ onNotify }) {
    const [projectTitle, setProjectTitle] = useState("İLKYAR ŞUBAT 2026 ANTALYA PROJESİ EKİBİ");
    const [projectAddress, setProjectAddress] = useState("Adres: Çiğdem Mah. 1588.Sok. No:81 06580 Çankaya/ANKARA");
    
    const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.COLLAGE_VOLUNTEERS, []));
    
    const [globalNameSize, setGlobalNameSize] = useState(16);
    const [pagePadding, setPagePadding] = useState(12);
    const [aiState, setAiState] = useState('idle');
    const [activeAction, setActiveAction] = useState(null);
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
      db.save(DB_KEYS.COLLAGE_VOLUNTEERS, volunteers);
      syncVolunteers(volunteers);
      
      // Analysis
      const issues = [];
      const missingPhotos = volunteers.filter(v => !v.photo);
      if (missingPhotos.length > 0) issues.push({ type: 'stock', msg: `${missingPhotos.length} fotoğraf henüz yüklenmemiş.` });
      
      const huseyinIndex = volunteers.findIndex(v => v.name.toLowerCase().includes("vural"));
      if (huseyinIndex !== 0 && volunteers.length > 0) {
        issues.push({ type: 'protocol', msg: "Hüseyin Hoca en başta mı? Kontrol edebilirsin" });
      }
      
      setWarnings(issues);
    }, [volunteers]);

    const handleAutoFix = useCallback(() => {
      setAiState('processing');
      setTimeout(() => {
        let baseList = [...volunteers];

        const sorted = baseList.sort((a, b) => {
          const isAVural = a.name.toLowerCase().includes("vural");
          const isBVural = b.name.toLowerCase().includes("vural");
          if (isAVural) return -1;
          if (isBVural) return 1;
          return a.name.localeCompare(b.name, 'tr');
        });

        setVolunteers(sorted);
        setAiState('idle');
        onNotify("Kolaj düzenlendi!");
      }, 1000);
    }, [volunteers, onNotify]);

    const handlePhotoUpdate = (id, scale, translateX, translateY) => {
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, scale, translateX, translateY } : v));
      setActiveAction(true);
      const timer = setTimeout(() => setActiveAction(null), 2000);
      return () => clearTimeout(timer);
    };

    const moveVolunteer = (index, direction) => {
      const newVolunteers = [...volunteers];
      const targetIndex = index + direction;
      if (targetIndex >= 0 && targetIndex < newVolunteers.length) {
        const temp = newVolunteers[index];
        newVolunteers[index] = newVolunteers[targetIndex];
        newVolunteers[targetIndex] = temp;
        setVolunteers(newVolunteers);
        setActiveAction(true);
        const timer = setTimeout(() => setActiveAction(null), 1000);
        return () => clearTimeout(timer);
      }
    };

    /**
     * FIXED: Volunteer deletion with proper database sync
     */
    const removeVolunteer = (id) => {
      const updatedVolunteers = volunteers.filter(v => v.id !== id);
      
      // 1. Update all databases FIRST
      syncVolunteers(updatedVolunteers);
      
      // 2. Then update state
      setVolunteers(updatedVolunteers);
      
      onNotify("Gönüllü tüm modüllerden silindi");
    };

    const updatePhotoSrc = (id, event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setVolunteers(prev => prev.map(v => v.id === id ? { ...v, photo: e.target.result, scale: 1, translateX: 0, translateY: 0 } : v));
        };
        reader.readAsDataURL(file);
      }
    };

    const count = volunteers.length;
    let cols = 3;
    if (count <= 4) cols = 2;
    else if (count <= 9) cols = 3;
    else if (count <= 16) cols = 4;
    else cols = 5;
    const rows = Math.ceil(count / cols);

    return (
      <div className="space-y-6">
        {/* BALKIZ & CONTROLS */}
        <div className="no-print">
           <BalkizRainbowConsole 
              aiState={aiState} 
              activeAction={activeAction} 
              warnings={warnings}
           />

           <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end">
              <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Type size={10}/> İsim Boyutu</label>
                  <input type="range" min="10" max="35" value={globalNameSize} onChange={(e) => setGlobalNameSize(parseInt(e.target.value))} className="w-full accent-indigo-600 cursor-pointer"/>
              </div>
              <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Maximize2 size={10}/> Kenar Payı</label>
                  <input type="range" min="0" max="30" value={pagePadding} onChange={(e) => setPagePadding(parseInt(e.target.value))} className="w-full accent-pink-600 cursor-pointer"/>
              </div>
              
              <div>
                <button onClick={handleAutoFix} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-xl font-bold flex gap-2 items-center justify-center shadow-lg shadow-fuchsia-200 transform active:scale-95 transition-all">
                  <Wand2 size={18}/> B.A.L.K.I.Z. Düzenlesin
                </button>
              </div>
           </div>
        </div>

        {/* A4 PAGE */}
        <div className="flex justify-center pb-20 print-container">
            <div 
              className=".print-page bg-white shadow-2xl overflow-hidden flex flex-col" 
              style={{ 
                  width: '210mm', 
                  height: '297mm', 
                  padding: `${pagePadding}mm`
              }}
            >
               {/* HEADER */}
               <div className="w-full mb-3 px-4 shrink-0">
                  <input 
                      value={projectTitle} 
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full text-center bg-transparent border-none outline-none font-comic font-black text-slate-900 tracking-tight"
                      style={{ fontSize: volunteers.length > 12 ? '22px' : '28px' }}
                  />
               </div>
               
               {/* GRID */}
               <div 
                  className="grid w-full gap-3 flex-1 min-h-0"
                  style={{
                      gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                  }}
               >
                  {volunteers.map((vol, index) => (
                     <div key={vol.id} className="relative flex flex-col items-center justify-center p-2 border border-slate-100 rounded-2xl bg-slate-50/20 group hover:border-indigo-400 transition-all overflow-hidden">
                        {/* Tools */}
                        <div className="absolute top-1 right-1 flex flex-col gap-1 no-print opacity-0 group-hover:opacity-100 transition-all z-40">
                          <button 
                            onClick={() => removeVolunteer(vol.id)} 
                            className="p-1 bg-white text-red-500 rounded-full shadow-sm border border-red-50 hover:scale-110"
                          >
                             <Trash2 size={10}/>
                          </button>
                          <button onClick={() => moveVolunteer(index, -1)} disabled={index === 0} className="p-1 bg-white text-indigo-600 rounded-full shadow-sm border border-indigo-50 hover:scale-110 disabled:opacity-30">
                             <ChevronUp size={10}/>
                          </button>
                          <button onClick={() => moveVolunteer(index, 1)} disabled={index === volunteers.length - 1} className="p-1 bg-white text-indigo-600 rounded-full shadow-sm border border-indigo-50 hover:scale-110 disabled:opacity-30">
                             <ChevronDown size={10}/>
                          </button>
                        </div>

                        <div className="relative w-full aspect-square mb-2 shrink-0 overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm">
                            <InteractivePhoto 
                                id={vol.id} src={vol.photo} scale={vol.scale}
                                translateX={vol.translateX} translateY={vol.translateY}
                                onUpdate={handlePhotoUpdate}
                            />
                            {!vol.photo && (
                                <input 
                                    type="file" accept="image/*" 
                                    onChange={(e) => updatePhotoSrc(vol.id, e)}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-30"
                                />
                            )}
                            {vol.photo && (
                                <label className="absolute top-1 left-1 no-print opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/90 rounded-full text-indigo-600 cursor-pointer z-40 shadow-sm border border-slate-100">
                                    <Upload size={12}/>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => updatePhotoSrc(vol.id, e)} />
                                </label>
                            )}
                        </div>

                        <div className="w-full px-1 text-center leading-[1.1] h-fit shrink-0">
                            <textarea 
                                value={vol.name} 
                                onChange={(e) => setVolunteers(volunteers.map(v => v.id === vol.id ? {...v, name: e.target.value} : v))}
                                className="w-full text-center bg-transparent border-none outline-none font-comic font-bold text-slate-800 tracking-tight resize-none overflow-hidden"
                                style={{ 
                                  fontSize: `${globalNameSize}px`,
                                  height: '2.5em',
                                }}
                                rows={2}
                            />
                        </div>
                     </div>
                  ))}
               </div>

               {/* FOOTER */}
               <div className="w-full mt-auto pt-4 px-4 shrink-0 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-4 text-indigo-600 font-black tracking-[0.25em] text-[18px] group/msg">
                      <span className="w-12 h-[2px] bg-indigo-100 group-hover/msg:w-20 transition-all duration-700"></span>
                      <Smile size={28} className="text-indigo-400 animate-bounce" />
                      <span className="uppercase drop-shadow-sm">MEKTUPLARINI BEKLİYORUZ</span>
                      <span className="w-12 h-[2px] bg-indigo-100 group-hover/msg:w-20 transition-all duration-700"></span>
                  </div>

                  <div className="w-full border-t border-slate-100 pt-1 pb-0">
                      <textarea 
                          value={projectAddress} 
                          onChange={(e) => setProjectAddress(e.target.value)}
                          className="w-full bg-transparent border-none outline-none font-sans text-slate-600 text-center font-bold resize-none leading-tight overflow-hidden"
                          style={{ fontSize: volunteers.length > 12 ? '10px' : '15px' }}
                          rows={1}
                      />
                  </div>
               </div>
            </div>
        </div>
      </div>
    );
  }

  // --- MODULE 4: DOCUMENT CREATOR ---
  function DocumentCreator({ onNotify }) {
    const [formData, setFormData] = useState({ 
      no: '2026/01', 
      date: '', 
      topic: 'Planlama', 
      location: 'Salon A', 
      participants: 'Müdür, Yürütücü', 
      decisions: '1. Karar 1\n2. Karar 2' 
    });
    
    return (
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 bg-white p-6 rounded-xl border print:hidden text-sm space-y-3">
          <h3 className="font-bold mb-2">Belge Bilgileri</h3>
          <input 
            className="w-full border p-2" 
            placeholder="No" 
            value={formData.no} 
            onChange={e=>setFormData({...formData, no:e.target.value})}
          />
          <textarea 
            className="w-full border p-2 h-40" 
            placeholder="Kaba Notlar (AI düzeltecek...)" 
            value={formData.decisions} 
            onChange={e=>setFormData({...formData, decisions:e.target.value})}
          />
        </div>
        <div className="flex-1 bg-white shadow-xl p-12 print:shadow-none print:p-0 min-h-[297mm]">
          <h1 className="text-center font-bold text-xl border-b-2 border-black pb-4 mb-8">TOPLANTI TUTANAĞI</h1>
          <table className="w-full border border-black mb-8 text-sm">
            <tbody>
              <tr>
                <td className="border p-2 font-bold bg-slate-100">Karar No</td>
                <td className="border p-2">{formData.no}</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold bg-slate-100">Kararlar</td>
                <td className="border p-2 whitespace-pre-wrap h-64 align-top">{formData.decisions}</td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-between mt-32 px-12">
            <div className="text-center font-bold">Raportör<div className="mt-8 border-t border-black w-32"></div></div>
            <div className="text-center font-bold">Onaylayan<div className="mt-8 border-t border-black w-32"></div></div>
          </div>
        </div>
      </div>
    );
  }
