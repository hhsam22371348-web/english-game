import React from 'react';
import { Volume2, VolumeX, Home, Sparkles, Award, ArrowLeft, ArrowRight } from 'lucide-react';
import { MapId } from '../types';
import { MAPS_METADATA } from '../data/quests';

interface HeaderProps {
  currentMapId: MapId;
  currentQuestNumber: number; // 1 to 5
  totalQuestsInMap: number; // 5
  stars: number;
  coins: number;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome: () => void;
  onOpenMapSelect?: () => void;
  unlockedMaps: MapId[];
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMapId,
  currentQuestNumber,
  totalQuestsInMap,
  stars,
  coins,
  isSoundEnabled,
  onToggleSound,
  onGoHome,
  onOpenMapSelect,
  unlockedMaps,
  onPrev,
  onNext,
  hasPrev = true,
  hasNext = true,
}) => {
  const currentMap = MAPS_METADATA.find((m) => m.id === currentMapId) || MAPS_METADATA[0];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-xs px-2 sm:px-6 py-2 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Star Counter & Return Home */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onGoHome}
            title="마을 광장(홈)으로 이동"
            className="p-1.5 sm:p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1 text-xs sm:text-sm font-bold active:scale-95"
          >
            <Home className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">홈</span>
          </button>

          {/* Stars (⭐) - Left side as per PRD */}
          <div
            className="flex items-center gap-1 bg-yellow-50 border border-yellow-300 px-2 sm:px-2.5 py-1 rounded-full shadow-xs"
            title="획득한 별"
          >
            <span className="text-base animate-bounce">⭐</span>
            <span className="font-extrabold text-amber-900 text-xs sm:text-sm tracking-wide">
              {stars}
            </span>
          </div>
        </div>

        {/* Center: Question number with Prev/Next Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          {onPrev && (
            <button
              id="header-btn-prev"
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-1 sm:px-2.5 sm:py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center gap-1 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              title="이전 퀘스트로 뒤로가기"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">이전</span>
            </button>
          )}

          <div className="bg-amber-500/10 border border-amber-400/40 text-amber-900 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-black tracking-wider flex items-center gap-1 shadow-xs">
            <span className="text-amber-600 font-bold hidden xs:inline">{currentMap.nameEn}</span>
            <span className="text-amber-400 font-normal hidden xs:inline">•</span>
            <span>{currentQuestNumber}/{totalQuestsInMap}</span>
          </div>

          {onNext && (
            <button
              id="header-btn-next"
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className="p-1 sm:px-2.5 sm:py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center gap-1 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              title="다음 퀘스트로 앞으로가기"
            >
              <span className="hidden sm:inline text-xs">다음</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Coins (🪙) - Right side as per PRD & Sound button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Coins (🪙) */}
          <div
            className="flex items-center gap-1 bg-amber-50 border border-amber-300 px-2 sm:px-2.5 py-1 rounded-full shadow-xs"
            title="획득한 코인"
          >
            <span className="text-base animate-pulse">🪙</span>
            <span className="font-extrabold text-amber-900 text-xs sm:text-sm tracking-wide">
              {coins}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isSoundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center active:scale-95 ${
              isSoundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-400 border-gray-300 hover:bg-gray-200'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
