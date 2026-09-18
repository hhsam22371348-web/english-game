import React from 'react';
import { MapId } from '../types';

interface TownSceneryProps {
  mapId: MapId;
}

export const TownScenery: React.FC<TownSceneryProps> = ({ mapId }) => {
  if (mapId === 'home') {
    return (
      <div className="relative w-full h-32 md:h-36 rounded-2xl overflow-hidden bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 border-2 border-amber-300 shadow-inner flex items-end justify-between px-6 pb-2">
        {/* Sky Elements */}
        <div className="absolute top-3 left-6 text-amber-500 animate-pulse text-2xl">☀️</div>
        <div className="absolute top-4 left-24 text-white/90 text-sm font-semibold bg-white/60 px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
          <span>☁️</span> 따뜻한 우리 집
        </div>
        <div className="absolute top-3 right-10 text-white/80 text-xl animate-bounce">🕊️</div>

        {/* Room / House Visuals */}
        <div className="flex items-end gap-3 z-10">
          <div className="text-4xl filter drop-shadow-sm">🏡</div>
          <div className="text-3xl filter drop-shadow-sm">🛏️</div>
          <div className="text-3xl filter drop-shadow-sm">🥞</div>
        </div>

        {/* Garden / Floor */}
        <div className="flex items-end gap-3 z-10">
          <div className="text-3xl">🐶</div>
          <div className="text-3xl">🪴</div>
          <div className="text-3xl">🚪</div>
        </div>

        {/* Warm floor board */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-amber-400/60" />
      </div>
    );
  }

  if (mapId === 'school') {
    return (
      <div className="relative w-full h-32 md:h-36 rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-100 via-teal-50 to-emerald-200 border-2 border-emerald-300 shadow-inner flex items-end justify-between px-6 pb-2">
        {/* Sky Elements */}
        <div className="absolute top-3 left-8 text-white/90 text-sm font-semibold bg-white/60 px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
          <span>🏫</span> 즐거운 퀘스트 초등학교
        </div>
        <div className="absolute top-3 right-8 text-yellow-500 text-2xl animate-spin" style={{ animationDuration: '10s' }}>
          ✨
        </div>

        {/* School Building & Items */}
        <div className="flex items-end gap-3 z-10">
          <div className="text-4xl filter drop-shadow-sm">🏫</div>
          <div className="text-3xl filter drop-shadow-sm">📚</div>
          <div className="text-3xl filter drop-shadow-sm">🎨</div>
        </div>

        {/* Playground elements */}
        <div className="flex items-end gap-3 z-10">
          <div className="text-3xl">⚽</div>
          <div className="text-3xl">🌳</div>
          <div className="text-3xl">🔔</div>
        </div>

        {/* Grass floor */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-emerald-400/60" />
      </div>
    );
  }

  // Market
  return (
    <div className="relative w-full h-32 md:h-36 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 via-blue-50 to-sky-200 border-2 border-sky-300 shadow-inner flex items-end justify-between px-6 pb-2">
      {/* Sky & Shop Sign */}
      <div className="absolute top-3 left-8 text-white/90 text-sm font-semibold bg-white/60 px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
        <span>🛒</span> 활기찬 퀘스트 마켓
      </div>
      <div className="absolute top-3 right-8 text-xl">🎈</div>

      {/* Market Stalls */}
      <div className="flex items-end gap-3 z-10">
        <div className="text-4xl filter drop-shadow-sm">🏪</div>
        <div className="text-3xl filter drop-shadow-sm">🍎</div>
        <div className="text-3xl filter drop-shadow-sm">🥖</div>
      </div>

      {/* Shopping Elements */}
      <div className="flex items-end gap-3 z-10">
        <div className="text-3xl">🛒</div>
        <div className="text-3xl">🍪</div>
        <div className="text-3xl">💵</div>
      </div>

      {/* Sidewalk floor */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-sky-400/60" />
    </div>
  );
};
