import React from 'react';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { MapId } from '../types';
import { MAPS_METADATA } from '../data/quests';

interface MapProgressBarProps {
  currentMapId: MapId;
  unlockedMaps: MapId[];
  completedMaps: MapId[];
  onSelectMap: (mapId: MapId) => void;
}

export const MapProgressBar: React.FC<MapProgressBarProps> = ({
  currentMapId,
  unlockedMaps,
  completedMaps,
  onSelectMap,
}) => {
  return (
    <div className="w-full bg-white/80 backdrop-blur-xs border border-amber-200/80 rounded-2xl p-2.5 sm:p-3 shadow-xs">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {MAPS_METADATA.map((map, index) => {
          const isUnlocked = unlockedMaps.includes(map.id);
          const isCompleted = completedMaps.includes(map.id);
          const isCurrent = currentMapId === map.id;

          return (
            <React.Fragment key={map.id}>
              <button
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onSelectMap(map.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 py-2 px-2 sm:px-3 rounded-xl transition-all relative ${
                  isCurrent
                    ? 'bg-amber-500 text-white shadow-md font-bold ring-2 ring-amber-300 scale-[1.02]'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-semibold'
                    : isUnlocked
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-semibold'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-75'
                }`}
              >
                {/* Badge Icon */}
                <span className="text-base sm:text-xl">{map.icon}</span>

                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                    {map.nameEn}
                  </span>
                  <span className="text-[10px] opacity-85 hidden sm:inline">
                    {isCompleted ? '정복 완료 ⭐' : isCurrent ? '탐험 중 🏃' : isUnlocked ? '도전 가능' : '잠김 🔒'}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="ml-auto">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  ) : null}
                </div>
              </button>

              {index < MAPS_METADATA.length - 1 && (
                <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
