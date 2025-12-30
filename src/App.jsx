import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, BookOpen, RefreshCw, Trophy, ChevronLeft, ChevronRight, CheckCircle, Clock, Target, Star, Settings, Play, RotateCcw, BookMarked, Lightbulb, Save, X, Check, AlertCircle, TrendingUp } from 'lucide-react';

const quranData = {
  totalPages: 604,
  totalJuz: 30,
  juzPages: {
    1: { start: 1, end: 21 }, 2: { start: 22, end: 41 }, 3: { start: 42, end: 61 },
    4: { start: 62, end: 81 }, 5: { start: 82, end: 101 }, 6: { start: 102, end: 121 },
    7: { start: 122, end: 141 }, 8: { start: 142, end: 161 }, 9: { start: 162, end: 181 },
    10: { start: 182, end: 201 }, 11: { start: 202, end: 221 }, 12: { start: 222, end: 241 },
    13: { start: 242, end: 261 }, 14: { start: 262, end: 281 }, 15: { start: 282, end: 301 },
    16: { start: 302, end: 321 }, 17: { start: 322, end: 341 }, 18: { start: 342, end: 361 },
    19: { start: 362, end: 381 }, 20: { start: 382, end: 401 }, 21: { start: 402, end: 421 },
    22: { start: 422, end: 441 }, 23: { start: 442, end: 461 }, 24: { start: 462, end: 481 },
    25: { start: 482, end: 501 }, 26: { start: 502, end: 521 }, 27: { start: 522, end: 541 },
    28: { start: 542, end: 561 }, 29: { start: 561, end: 580 }, 30: { start: 581, end: 604 }
  },
  pageSurahs: {
    1: "Fatiha", 2: "Bakara", 50: "Al-i İmran", 77: "Nisa", 106: "Maide",
    128: "En'am", 151: "A'raf", 177: "Enfal", 187: "Tevbe", 208: "Yunus",
    221: "Hud", 235: "Yusuf", 249: "Ra'd", 255: "İbrahim", 262: "Hicr",
    267: "Nahl", 282: "İsra", 293: "Kehf", 305: "Meryem", 312: "Taha",
    322: "Enbiya", 332: "Hac", 342: "Mü'minun", 350: "Nur", 359: "Furkan",
    367: "Şuara", 377: "Neml", 385: "Kasas", 396: "Ankebut", 404: "Rum",
    411: "Lokman", 415: "Secde", 418: "Ahzab", 428: "Sebe", 434: "Fatır",
    440: "Yasin", 446: "Saffat", 453: "Sad", 458: "Zümer", 467: "Mümin",
    477: "Fussilet", 483: "Şura", 489: "Zuhruf", 496: "Duhan", 499: "Casiye",
    502: "Ahkaf", 507: "Muhammed", 511: "Fetih", 515: "Hucurat", 518: "Kaf",
    520: "Zariyat", 523: "Tur", 526: "Necm", 528: "Kamer", 531: "Rahman",
    534: "Vakıa", 537: "Hadid", 542: "Mücadele", 545: "Haşr", 549: "Mümtehine",
    551: "Saf", 553: "Cuma", 554: "Münafikun", 556: "Tegabün", 558: "Talak",
    560: "Tahrim", 562: "Mülk", 564: "Kalem", 566: "Hakka", 568: "Mearic",
    570: "Nuh", 572: "Cin", 573: "Müzzemmil", 575: "Müddessir", 577: "Kıyame",
    578: "İnsan", 579: "Mürselat",
    581: "Nebe", 583: "Naziat", 585: "Abese",
    586: "Tekvir", 587: "İnfitar", 588: "Mutaffifin", 589: "İnşikak",
    590: "Büruc", 591: "Tarık", 592: "A'la", 593: "Gaşiye", 594: "Fecr",
    595: "Beled", 596: "Şems", 597: "Leyl", 598: "Duha",
    599: "İnşirah", 600: "Tin", 601: "Alak", 602: "Kadr",
    603: "Beyyine", 604: "Zilzal"
  }
};

function getSurahForPage(page) {
  const pageKeys = Object.keys(quranData.pageSurahs).map(Number).sort((a, b) => b - a);
  for (const key of pageKeys) {
    if (page >= key) return quranData.pageSurahs[key];
  }
  return "Fatiha";
}

function getJuzForPage(page) {
  for (let juz = 1; juz <= 30; juz++) {
    const { start, end } = quranData.juzPages[juz];
    if (page >= start && page <= end) return juz;
  }
  return 1;
}

const PAGE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  MEMORIZED: 'memorized',
  REVIEW: 'review'
};

const STATUS_CONFIG = {
  pending: { label: 'Bekliyor', bg: 'bg-gray-100', text: 'text-gray-500' },
  in_progress: { label: 'Çalışılıyor', bg: 'bg-amber-100', text: 'text-amber-600' },
  memorized: { label: 'Ezberlendi', bg: 'bg-emerald-100', text: 'text-emerald-600' },
  review: { label: 'Tekrar', bg: 'bg-blue-100', text: 'text-blue-600' }
};

const getInitialPageStatuses = () => {
  const initial = {};
  for (let p = 581; p <= 604; p++) {
    initial[p] = PAGE_STATUS.MEMORIZED;
  }
  return initial;
};

function getWeeklyDistribution(monthlyTarget) {
  const base = Math.floor(monthlyTarget / 4);
  const remainder = monthlyTarget % 4;
  return [
    base,
    base,
    base + (remainder >= 2 ? 1 : 0),
    base + (remainder >= 1 ? 1 : 0) + (remainder >= 3 ? 1 : 0)
  ];
}

// localStorage yardımcı fonksiyonları
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  }
};

export default function QuranHifzPlanner() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [planViewWeek, setPlanViewWeek] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [settings, setSettings] = useState({
    startDate: '2025-12-28',
    monthlyTarget: 8,
    startPage: 580
  });
  
  const [pageStatuses, setPageStatuses] = useState(getInitialPageStatuses);
  const [tempSettings, setTempSettings] = useState(settings);

  // Uygulama başladığında verileri yükle
  useEffect(() => {
    const savedSettings = storage.get('hifz-settings');
    if (savedSettings) {
      setSettings(savedSettings);
      setTempSettings(savedSettings);
    }
    
    const savedStatuses = storage.get('hifz-page-statuses');
    if (savedStatuses) {
      setPageStatuses(savedStatuses);
    }
    
    setIsLoaded(true);
  }, []);

  const saveSettings = () => {
    const newSettings = {...tempSettings};
    setSettings(newSettings);
    setShowSettings(false);
    storage.set('hifz-settings', newSettings);
  };

  const updatePageStatus = (page, status) => {
    const newStatuses = { ...pageStatuses, [page]: status };
    setPageStatuses(newStatuses);
    storage.set('hifz-page-statuses', newStatuses);
  };

  const bulkUpdateStatus = (pages, status) => {
    const newStatuses = { ...pageStatuses };
    pages.forEach(p => { newStatuses[p] = status; });
    setPageStatuses(newStatuses);
    storage.set('hifz-page-statuses', newStatuses);
  };

  // TÜM HESAPLAMALAR
  const monthlyTarget = settings.monthlyTarget;
  const weeklyTargetExact = monthlyTarget / 4;
  const weeklyTargetDisplay = weeklyTargetExact % 1 === 0 ? weeklyTargetExact.toString() : weeklyTargetExact.toFixed(1);
  const weeklyDistribution = getWeeklyDistribution(monthlyTarget);
  
  const today = new Date();
  
  const memorizedPages = Object.entries(pageStatuses)
    .filter(([key, status]) => status === PAGE_STATUS.MEMORIZED)
    .map(([page]) => parseInt(page));
  
  const memorizedCount = memorizedPages.length;
  const remainingPages = quranData.totalPages - memorizedCount;
  const progressPercent = ((memorizedCount / quranData.totalPages) * 100).toFixed(1);
  const weeksToComplete = Math.ceil(remainingPages / weeklyTargetExact);
  
  const completionDate = new Date(today);
  completionDate.setDate(completionDate.getDate() + (weeksToComplete * 7));
  
  const totalYears = Math.floor(weeksToComplete / 52);
  const remainingWeeksInYear = weeksToComplete % 52;
  const totalMonths = Math.floor(weeksToComplete / 4.33);

  // MILESTONE HESAPLAMALARI
  const calculateMilestones = () => {
    const weeklyExact = settings.monthlyTarget / 4;
    
    return [
      { juz: 25, label: '25. Cüze ulaşıldı' },
      { juz: 20, label: '20. Cüze ulaşıldı' },
      { juz: 15, label: 'Yarı yol! 15. Cüz' },
      { juz: 10, label: '10. Cüze ulaşıldı' },
      { juz: 5, label: 'Son 5 cüz!' },
      { juz: 1, label: '🎉 HAFIZ OLDUNUZ!' }
    ].map(m => {
      const targetPage = quranData.juzPages[m.juz].start;
      const pagesUntilMilestone = settings.startPage - targetPage + 1;
      const pagesAlreadyDone = memorizedCount - 24;
      const pagesNeeded = Math.max(0, pagesUntilMilestone - pagesAlreadyDone);
      const weeksNeeded = pagesNeeded > 0 ? Math.ceil(pagesNeeded / weeklyExact) : 0;
      const milestoneDate = new Date();
      milestoneDate.setDate(milestoneDate.getDate() + (weeksNeeded * 7));
      const isCompleted = pagesNeeded <= 0;
      return { ...m, weeksNeeded, date: milestoneDate, isCompleted, pagesNeeded };
    });
  };
  
  const milestones = calculateMilestones();

  // TEKRAR PLANI
  const generateReviewPlan = useCallback(() => {
    const reviews = [];
    const avgWeekly = Math.round(weeklyTargetExact);
    
    const recentMemorized = memorizedPages
      .filter(p => p < 581)
      .sort((a, b) => b - a);
    
    if (recentMemorized.length > 0) {
      const recentPages = recentMemorized.slice(0, avgWeekly * 2);
      if (recentPages.length > 0) {
        reviews.push({
          type: 'Yakın Tekrar',
          description: 'Son 2 haftada ezberlenen sayfalar',
          pages: recentPages,
          frequency: 'Her gün',
          color: 'emerald'
        });
      }
    }
    
    if (recentMemorized.length > Math.round(weeklyTargetExact) * 2) {
      const midPages = recentMemorized.slice(Math.round(weeklyTargetExact) * 2, Math.round(weeklyTargetExact) * 4);
      if (midPages.length > 0) {
        reviews.push({
          type: 'Haftalık Tekrar',
          description: '2-4 hafta önce ezberlenen',
          pages: midPages,
          frequency: 'Haftada 3 gün',
          color: 'blue'
        });
      }
    }
    
    if (recentMemorized.length > Math.round(weeklyTargetExact) * 4) {
      const oldPages = recentMemorized.slice(Math.round(weeklyTargetExact) * 4);
      if (oldPages.length > 0) {
        reviews.push({
          type: 'Aylık Tekrar',
          description: '1 aydan eski ezberler',
          pages: oldPages,
          frequency: 'Haftada 1-2 gün',
          color: 'purple'
        });
      }
    }
    
    reviews.push({
      type: '30. Cüz Tekrarı',
      description: 'Amme Cüzü (tamamlanmış)',
      pages: Array.from({ length: 24 }, (_, i) => 581 + i),
      frequency: 'Her Pazar',
      color: 'amber'
    });
    
    return reviews;
  }, [memorizedPages, weeklyTargetExact]);

  const reviewPlan = generateReviewPlan();

  // HAFTALIK PLAN OLUŞTUR
  const generatePlan = useCallback(() => {
    const plan = [];
    const pagesToMemorize = [];
    
    for (let p = settings.startPage; p >= 1; p--) {
      if (pageStatuses[p] !== PAGE_STATUS.MEMORIZED) {
        pagesToMemorize.push(p);
      }
    }
    
    if (pagesToMemorize.length === 0) return plan;
    
    let pageIndex = 0;
    let weekNumber = 1;
    const planStartDate = new Date(today);
    const dayOfWeek = planStartDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
    planStartDate.setDate(planStartDate.getDate() + daysToMonday);
    
    const distribution = getWeeklyDistribution(settings.monthlyTarget);
    
    while (pageIndex < pagesToMemorize.length && weekNumber <= 400) {
      const weekStart = new Date(planStartDate);
      weekStart.setDate(weekStart.getDate() + ((weekNumber - 1) * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekInCycle = (weekNumber - 1) % 4;
      const pagesThisWeek = distribution[weekInCycle];
      
      const weekPages = [];
      for (let i = 0; i < pagesThisWeek && pageIndex < pagesToMemorize.length; i++) {
        const page = pagesToMemorize[pageIndex];
        weekPages.push({
          page,
          surah: getSurahForPage(page),
          juz: getJuzForPage(page),
          status: pageStatuses[page] || PAGE_STATUS.PENDING
        });
        pageIndex++;
      }
      
      const completedAtWeek = memorizedCount + pageIndex;
      
      plan.push({
        week: weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        pages: weekPages,
        totalMemorized: Math.min(completedAtWeek, quranData.totalPages),
        progress: Math.min((completedAtWeek / quranData.totalPages) * 100, 100).toFixed(1),
        isCurrentWeek: weekNumber === 1
      });
      
      weekNumber++;
    }
    
    return plan;
  }, [settings.startPage, settings.monthlyTarget, pageStatuses, memorizedCount, today]);

  const studyPlan = generatePlan();

  const formatDate = (date) => date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatShortDate = (date) => date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  const formatDateWithYear = (date) => date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

  const PageStatusChanger = ({ page, currentStatus, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}
        >
          {currentStatus === 'memorized' && <CheckCircle size={12} />}
          {currentStatus === 'in_progress' && <Play size={12} />}
          {currentStatus === 'pending' && <Clock size={12} />}
          {currentStatus === 'review' && <RefreshCw size={12} />}
          {config.label}
        </button>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-30 min-w-[130px]">
              {Object.entries(STATUS_CONFIG).map(([status, conf]) => (
                <button
                  key={status}
                  onClick={() => { onUpdate(page, status); setIsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${status === currentStatus ? 'bg-gray-50' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full ${conf.bg}`} />
                  <span>{conf.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const SettingsModal = () => {
    const tempWeeklyExact = tempSettings.monthlyTarget / 4;
    const tempWeeklyDisplay = tempWeeklyExact % 1 === 0 ? tempWeeklyExact.toString() : tempWeeklyExact.toFixed(1);
    const tempWeeksToComplete = Math.ceil(remainingPages / tempWeeklyExact);
    const tempTotalYears = Math.floor(tempWeeksToComplete / 52);
    const tempRemainingWeeks = tempWeeksToComplete % 52;
    const tempCompletionDate = new Date();
    tempCompletionDate.setDate(tempCompletionDate.getDate() + (tempWeeksToComplete * 7));
    const tempDistribution = getWeeklyDistribution(tempSettings.monthlyTarget);
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Ayarlar</h2>
            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aylık Ezber Hedefi (sayfa)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="1"
                  value={tempSettings.monthlyTarget}
                  onChange={(e) => setTempSettings({ ...tempSettings, monthlyTarget: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-20 text-center">
                  <span className="text-3xl font-bold text-emerald-600">{tempSettings.monthlyTarget}</span>
                  <div className="text-xs text-gray-500">sayfa/ay</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Haftalık: {tempWeeklyDisplay} sayfa (dağılım: {tempDistribution.join('-')})
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Sayfası
              </label>
              <input
                type="number"
                min="1"
                max="604"
                value={tempSettings.startPage}
                onChange={(e) => setTempSettings({ ...tempSettings, startPage: parseInt(e.target.value) || 580 })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl"
              />
              <div className="mt-1 text-xs text-gray-500">
                {getJuzForPage(tempSettings.startPage)}. Cüz - {getSurahForPage(tempSettings.startPage)}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="text-sm text-emerald-700 font-medium mb-2">Tahmini Hesaplama</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Kalan {remainingPages} sayfa için:</div>
                <div className="font-semibold text-emerald-700 text-lg">
                  {tempTotalYears > 0 ? `${tempTotalYears} yıl ` : ''}{tempRemainingWeeks} hafta
                </div>
                <div className="text-xs text-gray-500">
                  Tahmini bitiş: {formatDateWithYear(tempCompletionDate)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-2">
            <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">
              İptal
            </button>
            <button onClick={saveSettings} className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-2">
              <Save size={18} />
              Kaydet
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DashboardTab = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Aylık Hedef</div>
            <div className="text-2xl font-bold text-gray-800">{settings.monthlyTarget} sayfa</div>
            <div className="text-xs text-gray-400">Haftalık {weeklyTargetDisplay} sayfa (dağılım: {weeklyDistribution.join('-')})</div>
          </div>
          <button onClick={() => { setTempSettings({...settings}); setShowSettings(true); }} className="p-3 bg-emerald-100 rounded-xl hover:bg-emerald-200">
            <Settings size={20} className="text-emerald-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} />
            <span className="text-xs opacity-90">Ezberlenen</span>
          </div>
          <div className="text-3xl font-bold">{memorizedCount}</div>
          <div className="text-xs opacity-75">sayfa</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} />
            <span className="text-xs opacity-90">Kalan</span>
          </div>
          <div className="text-3xl font-bold">{remainingPages}</div>
          <div className="text-xs opacity-75">sayfa</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs opacity-90">İlerleme</span>
          </div>
          <div className="text-3xl font-bold">%{progressPercent}</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} />
            <span className="text-xs opacity-90">Tahmini Bitiş</span>
          </div>
          <div className="text-base font-bold">{formatDateWithYear(completionDate)}</div>
          <div className="text-xs opacity-75">{weeksToComplete} hafta</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Genel İlerleme</h3>
          <span className="text-sm text-emerald-600 font-medium">%{progressPercent}</span>
        </div>
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>0</span>
          <span>{memorizedCount} / {quranData.totalPages}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Cüz Durumu (30→1)</h3>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 30 }, (_, i) => 30 - i).map(juz => {
            const { start, end } = quranData.juzPages[juz];
            const juzPageList = [];
            for (let p = start; p <= end; p++) juzPageList.push(p);
            const memorizedInJuz = juzPageList.filter(p => pageStatuses[p] === PAGE_STATUS.MEMORIZED).length;
            const percent = (memorizedInJuz / juzPageList.length) * 100;
            
            let bgClass = 'bg-gray-100 text-gray-400';
            if (percent === 100) bgClass = 'bg-emerald-500 text-white';
            else if (percent > 0) bgClass = 'bg-amber-400 text-white';
            
            return (
              <div key={juz} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${bgClass}`} title={`${juz}. Cüz - %${percent.toFixed(0)}`}>
                {juz}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> Tamamlandı</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-400" /> Devam</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200" /> Bekliyor</span>
        </div>
      </div>

      {studyPlan.length > 0 && studyPlan[0] && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Bu Hafta - Yeni Ezber</h3>
              <div className="text-sm text-gray-500">{formatShortDate(studyPlan[0].startDate)} - {formatShortDate(studyPlan[0].endDate)}</div>
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">{studyPlan[0].pages.length} sayfa</div>
          </div>
          
          <div className="space-y-2">
            {studyPlan[0].pages.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${item.status === 'memorized' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-600'}`}>
                    {item.page}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{item.surah}</div>
                    <div className="text-xs text-gray-500">{item.juz}. Cüz</div>
                  </div>
                </div>
                <PageStatusChanger page={item.page} currentStatus={item.status} onUpdate={updatePageStatus} />
              </div>
            ))}
          </div>
          
          <button onClick={() => bulkUpdateStatus(studyPlan[0].pages.map(p => p.page), PAGE_STATUS.MEMORIZED)} className="w-full mt-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 flex items-center justify-center gap-2">
            <CheckCircle size={18} />
            Tümünü Ezberlendi İşaretle
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">Bu Hafta - Tekrar Planı</h3>
        </div>
        
        <div className="space-y-3">
          {reviewPlan.map((review, idx) => (
            <div key={idx} className={`rounded-xl p-4 ${
              review.color === 'emerald' ? 'bg-emerald-50' :
              review.color === 'blue' ? 'bg-blue-50' :
              review.color === 'purple' ? 'bg-purple-50' : 'bg-amber-50'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className={`font-medium ${
                    review.color === 'emerald' ? 'text-emerald-700' :
                    review.color === 'blue' ? 'text-blue-700' :
                    review.color === 'purple' ? 'text-purple-700' : 'text-amber-700'
                  }`}>{review.type}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{review.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Sayfa: {review.pages[review.pages.length - 1]} - {review.pages[0]} ({review.pages.length} sayfa)
                  </div>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  review.color === 'emerald' ? 'bg-emerald-200 text-emerald-800' :
                  review.color === 'blue' ? 'bg-blue-200 text-blue-800' :
                  review.color === 'purple' ? 'bg-purple-200 text-purple-800' : 'bg-amber-200 text-amber-800'
                }`}>{review.frequency}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PlanTab = () => {
    const visibleWeeks = studyPlan.slice(planViewWeek, planViewWeek + 5);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <button onClick={() => setPlanViewWeek(Math.max(0, planViewWeek - 5))} disabled={planViewWeek === 0} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="font-medium">Hafta {planViewWeek + 1} - {Math.min(planViewWeek + 5, studyPlan.length)}</div>
            <div className="text-xs text-gray-500">Toplam {studyPlan.length} hafta • {weeklyTargetDisplay} sayfa/hafta</div>
          </div>
          <button onClick={() => setPlanViewWeek(Math.min(Math.max(0, studyPlan.length - 5), planViewWeek + 5))} disabled={planViewWeek >= studyPlan.length - 5} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
            <ChevronRight size={20} />
          </button>
        </div>

        {visibleWeeks.map((week) => {
          const allMemorized = week.pages.every(p => p.status === PAGE_STATUS.MEMORIZED);
          
          return (
            <div key={week.week} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${week.isCurrentWeek ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'}`}>
              <div className={`p-4 ${allMemorized ? 'bg-emerald-50' : week.isCurrentWeek ? 'bg-emerald-500 text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {allMemorized && <CheckCircle className="text-emerald-500" size={18} />}
                    <div>
                      <div className={`font-semibold ${week.isCurrentWeek && !allMemorized ? 'text-white' : ''}`}>
                        {week.week}. Hafta {week.isCurrentWeek && '(Bu Hafta)'} - {week.pages.length} sayfa
                      </div>
                      <div className={`text-sm ${week.isCurrentWeek && !allMemorized ? 'text-emerald-100' : 'text-gray-500'}`}>
                        {formatShortDate(week.startDate)} - {formatShortDate(week.endDate)}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${week.isCurrentWeek && !allMemorized ? 'text-white' : 'text-gray-700'}`}>%{week.progress}</div>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {week.pages.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${item.status === PAGE_STATUS.MEMORIZED ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                        {item.page}
                      </div>
                      <span className="text-sm text-gray-700">{item.surah}</span>
                      <span className="text-xs text-gray-400">{item.juz}. Cüz</span>
                    </div>
                    <PageStatusChanger page={item.page} currentStatus={item.status} onUpdate={updatePageStatus} />
                  </div>
                ))}
                
                {!allMemorized && (
                  <button onClick={() => bulkUpdateStatus(week.pages.map(p => p.page), PAGE_STATUS.MEMORIZED)} className="w-full mt-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100">
                    Tümünü Ezberlendi İşaretle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const CalendarTab = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = (firstDay.getDay() + 6) % 7;
    const days = [];
    
    for (let i = 0; i < startPadding; i++) days.push({ day: null });
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const weekPlan = studyPlan.find(w => date >= w.startDate && date <= w.endDate);
      days.push({ day: d, date, isToday: date.toDateString() === today.toDateString(), pages: weekPlan?.pages || [] });
    }
    
    const monthName = calendarMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><ChevronLeft size={20} /></button>
          <div className="font-semibold text-lg capitalize">{monthName}</div>
          <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><ChevronRight size={20} /></button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {days.map((d, idx) => {
              if (d.day === null) return <div key={idx} className="p-2 min-h-[70px] bg-gray-50/50" />;
              
              return (
                <div key={idx} className={`p-1.5 min-h-[70px] border-t border-l border-gray-100 ${d.isToday ? 'bg-emerald-50' : ''}`}>
                  <div className={`text-xs font-medium mb-1 ${d.isToday ? 'text-emerald-600' : 'text-gray-600'}`}>{d.day}</div>
                  {d.pages.length > 0 && (
                    <div className="space-y-0.5">
                      {d.pages.slice(0, 2).map((p, i) => (
                        <div key={i} className={`text-xs px-1 py-0.5 rounded truncate ${
                          p.status === PAGE_STATUS.MEMORIZED ? 'bg-emerald-100 text-emerald-700' :
                          p.status === PAGE_STATUS.IN_PROGRESS ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>{p.page}</div>
                      ))}
                      {d.pages.length > 2 && <div className="text-xs text-gray-400 pl-1">+{d.pages.length - 2}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const TechniquesTab = () => (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
        <h2 className="text-lg font-bold mb-1">Hafızlık Ezberleme Teknikleri</h2>
        <p className="text-emerald-100 text-sm">Hafızların kullandığı en etkili yöntemler</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm">1</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Sayfa Üçe Bölme Tekniği</h3>
              <p className="text-gray-600 text-sm mb-3">Sayfayı üç bölüme ayırın. Her bölümü ayrı ayrı ezberleyin, sonra birleştirin.</p>
              <div className="bg-emerald-50 rounded-xl p-3 space-y-1.5">
                {['İlk bölümü 15-20 kez okuyun', 'İkinci bölümü aynı şekilde çalışın', 'İlk iki bölümü birlikte tekrarlayın', 'Üçüncü bölümü ekleyin ve tamamlayın'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Beş-Bir (5+1) Tekniği</h3>
              <p className="text-gray-600 text-sm mb-3">Her ayeti 5 kez okuyun, sonra önceki ayetle birlikte 1 kez okuyun.</p>
              <div className="bg-blue-50 rounded-xl p-3 space-y-1.5 text-sm">
                <div className="flex items-center gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">A</span><span>1. ayeti 5 kez okuyun</span></div>
                <div className="flex items-center gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">B</span><span>2. ayeti 5 kez okuyun</span></div>
                <div className="flex items-center gap-2"><span className="w-5 h-5 bg-blue-300 rounded-full flex items-center justify-center text-xs font-bold text-white">→</span><span>1+2. ayeti birlikte 1 kez okuyun</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-sm">3</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Zincirleme Tekrar (Muraca'a)</h3>
              <p className="text-gray-600 text-sm mb-3">Yeni ezberi eski ezberlerle birleştirerek güçlendirin.</p>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-purple-50 rounded-lg p-2"><div className="text-purple-600 font-bold">Sabah</div><div className="text-xs text-gray-500">Yeni + Dünkü</div></div>
                <div className="bg-purple-50 rounded-lg p-2"><div className="text-purple-600 font-bold">Öğle</div><div className="text-xs text-gray-500">Haftalık</div></div>
                <div className="bg-purple-50 rounded-lg p-2"><div className="text-purple-600 font-bold">Akşam</div><div className="text-xs text-gray-500">Aylık</div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold text-sm">4</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">33 Tekrar Kuralı</h3>
              <p className="text-gray-600 text-sm mb-3">Yeni sayfayı yatmadan önce 33 kez yüzüne okuyun, sabah ezber yapın.</p>
              <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between text-sm">
                <div className="text-center"><div className="text-lg">🌙</div><div className="text-xs text-gray-600">33x oku</div></div>
                <div className="text-amber-400">→</div>
                <div className="text-center"><div className="text-lg">😴</div><div className="text-xs text-gray-600">Uyu</div></div>
                <div className="text-amber-400">→</div>
                <div className="text-center"><div className="text-lg">🌅</div><div className="text-xs text-gray-600">Ezberle</div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 font-bold text-sm">5</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Görsel Hafıza Tekniği</h3>
              <p className="text-gray-600 text-sm mb-2">Her zaman aynı mushafı kullanın. Sayfa düzeni görsel hafızanıza yerleşir.</p>
              <div className="space-y-1">
                {['Aynı mushafı kullanın', 'Ayetlerin konumunu hatırlayın', 'Zor yerler için renk kodlama'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm"><Star size={12} className="text-rose-500" /><span className="text-gray-600">{item}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 font-bold text-sm">6</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Dinleme & Gölge Okuma</h3>
              <p className="text-gray-600 text-sm"><span className="font-medium text-cyan-700">Önerilen: </span>Mishary Al-Afasy, Abdul Rahman Al-Sudais, Fatih Çollak</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="text-amber-400" size={18} />
          <h3 className="font-semibold">Altın Kurallar</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm">
          {['"Az ama her gün" düzensiz uzun seanslardan iyidir', 'Sabah namazı sonrası en verimli zamandır', 'Ezberlediğinizi namazda okuyarak pekiştirin', 'Yüksek sesle okumak konsantrasyonu artırır', 'Birine dinletmek (tasmi) kalıcılığı artırır', 'Manasını anlamak ezberi kolaylaştırır'].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs flex-shrink-0">{i + 1}</div>
              <span className="text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Önerilen Günlük Program</h3>
        <div className="space-y-2">
          {[
            { time: '05:30', title: 'Sabah Namazı Sonrası', desc: 'Yeni ezber (45-60 dk)', bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { time: '13:00', title: 'Öğle Arası', desc: 'Dünkü sayfa tekrarı (15-20 dk)', bg: 'bg-blue-50', text: 'text-blue-600' },
            { time: '17:00', title: 'İkindi Sonrası', desc: 'Haftalık tekrar (20-30 dk)', bg: 'bg-purple-50', text: 'text-purple-600' },
            { time: '21:00', title: 'Yatmadan Önce', desc: 'Yarınki sayfayı 33x oku', bg: 'bg-amber-50', text: 'text-amber-600' }
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${item.bg}`}>
              <div className={`${item.text} font-bold w-14 text-sm`}>{item.time}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const StatsTab = () => {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Toplam Süre</div>
            <div className="text-xl font-bold text-gray-800">
              {totalYears > 0 ? `${totalYears} yıl ` : ''}{remainingWeeksInYear} hafta
            </div>
            <div className="text-xs text-gray-400 mt-1">~{totalMonths} ay</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Aylık Hedef</div>
            <div className="text-xl font-bold text-emerald-600">{settings.monthlyTarget} sayfa</div>
            <div className="text-xs text-gray-400 mt-1">Haftalık {weeklyTargetDisplay} sayfa</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Hafızlık Yolculuğu</h3>
          
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
            
            <div className="space-y-4">
              <div className="relative flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10"><Play size={12} className="text-white" /></div>
                <div className="flex-1 bg-emerald-50 rounded-xl p-3">
                  <div className="font-medium text-emerald-700">Şu An</div>
                  <div className="text-sm text-gray-600">%{progressPercent} tamamlandı ({memorizedCount} sayfa)</div>
                </div>
              </div>

              {milestones.map((m) => (
                <div key={m.juz} className="relative flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${m.isCompleted ? 'bg-emerald-500' : m.juz === 1 ? 'bg-amber-500' : 'bg-blue-500'}`}>
                    {m.isCompleted ? <CheckCircle size={12} className="text-white" /> : m.juz === 1 ? <Trophy size={12} className="text-white" /> : <span className="text-white text-xs font-bold">{m.juz}</span>}
                  </div>
                  <div className={`flex-1 rounded-xl p-3 ${m.isCompleted ? 'bg-emerald-50' : m.juz === 1 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <div className={`font-medium ${m.isCompleted ? 'text-emerald-700' : m.juz === 1 ? 'text-amber-700' : 'text-gray-700'}`}>{m.label}</div>
                    <div className="text-sm text-gray-500">{m.isCompleted ? 'Tamamlandı ✓' : formatDate(m.date)}</div>
                    {!m.isCompleted && <div className="text-xs text-gray-400">{m.weeksNeeded} hafta sonra</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Detaylı Bilgiler</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Toplam Sayfa', value: quranData.totalPages },
              { label: 'Ezberlenen', value: `${memorizedCount} sayfa`, highlight: true },
              { label: 'Kalan', value: `${remainingPages} sayfa` },
              { label: 'Haftalık Tempo', value: `${weeklyTargetDisplay} sayfa` },
              { label: 'Kalan Hafta', value: weeksToComplete },
              { label: 'Tahmini Bitiş', value: formatDate(completionDate), highlight: true }
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-600">{item.label}</span>
                <span className={item.highlight ? 'font-bold text-emerald-600' : 'font-medium'}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white text-center">
          <div className="text-3xl mb-2">📖</div>
          <p className="font-medium mb-1">"Kim Kur'an'ı ezberler ve onunla amel ederse, Allah onu cennetine koyar."</p>
          <p className="text-emerald-200 text-sm">Hz. Muhammed (s.a.v.)</p>
        </div>
      </div>
    );
  };

  // Veriler yüklenene kadar loading göster
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showSettings && <SettingsModal />}
      
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Hafızlık Planlayıcı</h1>
              <p className="text-emerald-100 text-sm">Dinamik Ezber Takip</p>
            </div>
            <button onClick={() => { setTempSettings({...settings}); setShowSettings(true); }} className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex">
            {[
              { id: 'dashboard', label: 'Özet', icon: Target },
              { id: 'plan', label: 'Plan', icon: BookMarked },
              { id: 'calendar', label: 'Takvim', icon: Calendar },
              { id: 'techniques', label: 'Teknik', icon: Lightbulb },
              { id: 'stats', label: 'İstatistik', icon: Trophy },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-medium border-b-2 transition-all ${activeTab === tab.id ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent'}`}>
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'plan' && <PlanTab />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'techniques' && <TechniquesTab />}
        {activeTab === 'stats' && <StatsTab />}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 text-center">
        <p className="text-gray-400 text-xs">Allah hafızlık yolculuğunuzu mübarek kılsın 🤲</p>
      </div>
    </div>
  );
}
