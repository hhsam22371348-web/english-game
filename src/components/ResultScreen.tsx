import React, { useState } from 'react';
import {
  Trophy,
  Star,
  Coins,
  RotateCcw,
  Home,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Award,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Quest, MapId } from '../types';
import { MAPS_METADATA } from '../data/quests';
import { playSfx, speakEnglish } from '../utils/audio';

interface ResultScreenProps {
  stars: number;
  coins: number;
  firstTryCorrectCount: number;
  totalQuests: number; // 15
  completedMaps: MapId[];
  mistakeQuests: Quest[];
  playerName: string;
  isSoundEnabled: boolean;
  onRestart: () => void;
  onGoHome: () => void;
  onSelectMapToPlay: (mapId: MapId) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stars,
  coins,
  firstTryCorrectCount,
  totalQuests,
  completedMaps,
  mistakeQuests,
  playerName,
  isSoundEnabled,
  onRestart,
  onGoHome,
  onSelectMapToPlay,
  onPrev,
  onNext,
}) => {
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [resolvedMistakes, setResolvedMistakes] = useState<string[]>([]);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const handlePlayWord = (text: string) => {
    playSfx('click', isSoundEnabled);
    setPlayingWord(text);
    speakEnglish(text, {
      onEnd: () => setPlayingWord(null),
      onError: () => setPlayingWord(null),
    });
  };

  const handleResolveMistake = (questId: string) => {
    playSfx('correct', isSoundEnabled);
    playSfx('star', isSoundEnabled);
    setResolvedMistakes((prev) => [...prev, questId]);
    setActiveReviewId(null);
  };

  // Rank / Title calculation
  let titleBadge = '🌟 멋진 영어 탐험가';
  let titleDesc = '생활 영어 표현을 훌륭하게 익혔어요!';
  let titleColor = 'text-amber-700 bg-amber-100 border-amber-300';

  if (firstTryCorrectCount >= 14) {
    titleBadge = '🏆 전설의 타운 마스터';
    titleDesc = '놀라워요! 완벽에 가까운 실력으로 타운을 평정했어요!';
    titleColor = 'text-yellow-800 bg-yellow-100 border-yellow-400';
  } else if (firstTryCorrectCount < 10) {
    titleBadge = '🌱 무럭무럭 새싹 탐험가';
    titleDesc = '틀린 표현들을 다시 복습하며 실력을 쑥쑥 키워봐요!';
    titleColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 p-3 sm:p-6 select-none flex flex-col justify-between">
      {/* Top Global Navigation Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-2 z-10">
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white/80 hover:bg-white text-amber-900 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 active:scale-95 shadow-xs disabled:opacity-40"
          title="게임 화면으로 뒤로가기"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" />
          <span>뒤로가기 (게임으로)</span>
        </button>

        <span className="text-xs font-black text-amber-900/70 tracking-wide bg-amber-100/70 px-3 py-1 rounded-full">
          🏆 결과 화면 (Results)
        </span>

        <button
          onClick={onNext || onGoHome}
          className="px-3.5 py-1.5 rounded-xl border border-amber-400 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black transition flex items-center gap-1.5 active:scale-95 shadow-sm"
          title="처음 화면으로 앞으로가기"
        >
          <span>앞으로가기 (처음으로)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-3xl w-full mx-auto flex flex-col gap-6 my-2">
        {/* Top Header Card */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-white rounded-3xl shadow-lg border-2 border-amber-300 mb-2">
            <Trophy className="w-10 h-10 text-amber-500 animate-bounce" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-amber-950">
            {playerName || '꼬마 탐험가'}의 탐험 결과 보고서
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-800/80 mt-1">
            English Quest Town의 모든 맵 퀘스트를 완료했습니다!
          </p>

          {/* Title Badge */}
          <div className={`inline-block mt-3 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-black shadow-xs ${titleColor}`}>
            {titleBadge} • <span className="font-semibold">{titleDesc}</span>
          </div>
        </div>

        {/* 1. 완료한 맵 표시 (Completed Maps Display as per PRD) */}
        <div className="bg-white/95 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <h2 className="text-sm sm:text-base font-black text-amber-950 flex items-center gap-2 mb-3">
            <span>🗺️</span> 완료한 맵 (HOME • SCHOOL • MARKET)
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {MAPS_METADATA.map((map) => {
              const isDone = completedMaps.includes(map.id);
              return (
                <div
                  key={map.id}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-1">{map.icon}</div>
                  <div className="font-black text-xs sm:text-sm">{map.nameEn}</div>
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>정복 완료</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Scoreboard (별, 코인, 정답 수 13/15 형식 as per PRD table) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* 획득 별 */}
          <div className="bg-white/95 border-2 border-yellow-300 rounded-3xl p-3 sm:p-4 text-center shadow-sm flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-4xl mb-1">⭐</span>
            <span className="text-xs font-bold text-gray-500">획득 별</span>
            <span className="text-xl sm:text-3xl font-black text-amber-900 mt-0.5">
              {stars}
            </span>
          </div>

          {/* 획득 코인 */}
          <div className="bg-white/95 border-2 border-amber-300 rounded-3xl p-3 sm:p-4 text-center shadow-sm flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-4xl mb-1">🪙</span>
            <span className="text-xs font-bold text-gray-500">획득 코인</span>
            <span className="text-xl sm:text-3xl font-black text-amber-900 mt-0.5">
              {coins}
            </span>
          </div>

          {/* 정답 수 (13/15 형식 exactly as requested in PRD) */}
          <div className="bg-white/95 border-2 border-emerald-300 rounded-3xl p-3 sm:p-4 text-center shadow-sm flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-4xl mb-1">🎯</span>
            <span className="text-xs font-bold text-gray-500">정답 수</span>
            <span className="text-xl sm:text-3xl font-black text-emerald-900 mt-0.5">
              {firstTryCorrectCount}/{totalQuests}
            </span>
          </div>
        </div>

        {/* 3. 틀린 단어 및 표현 목록 (틀린 표현 복습 as per PRD) */}
        <div className="bg-white/95 border-2 border-amber-200 rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-amber-100 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                틀린 표현 복습 노트 (Review Mistakes)
              </h2>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {mistakeQuests.length === 0
                ? '오답 없음 🎉'
                : `${mistakeQuests.length - resolvedMistakes.length}개 복습 필요`}
            </span>
          </div>

          {mistakeQuests.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <span className="text-5xl mb-2">🎉</span>
              <p className="font-black text-emerald-950 text-base">
                모든 15개 퀘스트를 완벽하게 정답으로 맞혔어요!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                틀린 단어가 없습니다. 완벽한 실력이에요!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-amber-800 font-semibold mb-1">
                아래 단어들의 스피커를 눌러 원어민 발음을 다시 듣고 확실하게 내 것으로 만들어보세요!
              </p>

              {mistakeQuests.map((quest) => {
                const isResolved = resolvedMistakes.includes(quest.id);
                const isReviewActive = activeReviewId === quest.id;

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                      isResolved
                        ? 'bg-emerald-50/70 border-emerald-300 opacity-90'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{quest.npcAvatar}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm sm:text-base text-amber-950">
                              {quest.keyVocab.word}
                            </span>
                            <span className="text-xs font-bold text-amber-700">
                              {quest.keyVocab.pronunciation}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">
                            뜻: {quest.keyVocab.meaning} ({quest.title})
                          </span>
                        </div>
                      </div>

                      {/* Listen audio button */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlayWord(quest.keyVocab.exampleSentence || quest.keyVocab.word)}
                          disabled={playingWord === quest.keyVocab.word}
                          className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                          title="발음 듣기"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>듣기</span>
                        </button>

                        {!isResolved ? (
                          <button
                            onClick={() => handleResolveMistake(quest.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition active:scale-95 shadow-xs"
                          >
                            복습 완료 ✓
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                            마스터 완료 ⭐
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Example sentence */}
                    <div className="text-xs text-gray-700 bg-white/70 p-2 rounded-xl border border-amber-100">
                      <strong>예문:</strong> "{quest.keyVocab.exampleSentence}" ({quest.npcSpeechKorean})
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Bottom Action & Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* [뒤로가기] Button */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="w-full sm:w-48 py-3.5 px-4 bg-white hover:bg-gray-50 border-2 border-amber-300 text-amber-950 rounded-2xl font-black text-sm sm:text-base shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition active:scale-98"
              title="게임으로 뒤로가기"
            >
              <ArrowLeft className="w-5 h-5 text-amber-600" />
              <span>뒤로가기 (게임)</span>
            </button>
          )}

          {/* [다시 하기] Button */}
          <button
            onClick={() => {
              playSfx('click', isSoundEnabled);
              onRestart();
            }}
            className="w-full sm:w-56 py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-base sm:text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition active:scale-98"
          >
            <RotateCcw className="w-5 h-5" />
            <span>다시 하기</span>
          </button>

          {/* [앞으로가기 / 처음으로] Button */}
          <button
            onClick={() => {
              playSfx('click', isSoundEnabled);
              if (onNext) onNext();
              else onGoHome();
            }}
            className="w-full sm:w-48 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition active:scale-98"
          >
            <span>앞으로가기 (홈)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
