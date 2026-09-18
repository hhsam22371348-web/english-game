import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowRight, Star } from 'lucide-react';
import { MapId } from '../types';
import { MAPS_METADATA } from '../data/quests';
import { playSfx } from '../utils/audio';

interface MapCompleteModalProps {
  completedMapId: MapId;
  nextMapId: MapId | null; // null if final market map
  isSoundEnabled: boolean;
  onContinue: () => void;
  onViewResults?: () => void;
}

export const MapCompleteModal: React.FC<MapCompleteModalProps> = ({
  completedMapId,
  nextMapId,
  isSoundEnabled,
  onContinue,
  onViewResults,
}) => {
  const currentMap = MAPS_METADATA.find((m) => m.id === completedMapId) || MAPS_METADATA[0];
  const nextMap = MAPS_METADATA.find((m) => m.id === nextMapId);

  useEffect(() => {
    playSfx('victory', isSoundEnabled);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, [completedMapId, isSoundEnabled]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-4 border-amber-300 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center transform animate-scaleUp">
        {/* Big Celebration Icon */}
        <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-5xl mb-4 border-2 border-amber-400 shadow-inner">
          {completedMapId === 'market' ? '🏆' : currentMap.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mb-1">
          {currentMap.nameEn} 맵 완료!
        </h2>
        <p className="text-sm font-bold text-amber-800 mb-4">
          축하합니다! 5개의 퀘스트를 모두 정복했어요!
        </p>

        {/* Stars reward summary */}
        <div className="flex items-center justify-center gap-1.5 my-3 bg-yellow-50 border border-yellow-300 py-2.5 px-4 rounded-2xl">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className="text-2xl sm:text-3xl animate-bounce" style={{ animationDelay: `${s * 100}ms` }}>
              ⭐
            </span>
          ))}
        </div>

        {/* Next Unlocked Notification */}
        {nextMap ? (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 my-4 text-emerald-950">
            <span className="text-xs font-black uppercase text-emerald-700 block mb-0.5">
              새로운 모험 지역 잠금 해제!
            </span>
            <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-black">
              <span>{nextMap.icon}</span>
              <span>{nextMap.nameEn} ({nextMap.nameKo})</span>
            </div>
            <p className="text-xs text-emerald-800 mt-1 font-medium">
              {nextMap.tagline}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 my-4 text-amber-950">
            <span className="text-xs font-black uppercase text-amber-700 block mb-0.5">
              🎉 3대 맵 올클리어!
            </span>
            <div className="text-base sm:text-lg font-black">
              마을의 모든 퀘스트를 완수했어요!
            </div>
            <p className="text-xs text-amber-800 mt-1 font-medium">
              최종 학습 결과와 복습 노트를 확인해보세요.
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={nextMap ? onContinue : onViewResults}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition active:scale-98 mt-2"
        >
          <span>{nextMap ? `${nextMap.nameEn} 맵으로 출발!` : '최종 결과 보러 가기!'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
