import React, { useState } from 'react';
import { Play, Volume2, Sparkles, MapPin, Trophy, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { playSfx, speakEnglish } from '../utils/audio';

interface StartScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (avatar: string) => void;
  onStartGame: () => void;
  isSoundEnabled: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

const AVATARS = [
  { id: 'toby', emoji: '🐶', name: '토비', title: '명랑한 강아지' },
  { id: 'mia', emoji: '👧', name: '미아', title: '용감한 모험가' },
  { id: 'leo', emoji: '👦', name: '레오', title: '똑똑한 탐험대장' },
  { id: 'bunny', emoji: '🐰', name: '버니', title: '호기심 파티시에' },
];

export const StartScreen: React.FC<StartScreenProps> = ({
  playerName,
  setPlayerName,
  selectedAvatar,
  setSelectedAvatar,
  onStartGame,
  isSoundEnabled,
  onPrev,
  onNext,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleAudioTest = () => {
    playSfx('click', isSoundEnabled);
    setIsPlayingAudio(true);
    speakEnglish('Welcome to English Quest Town! Are you ready?', {
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleStart = () => {
    playSfx('click', isSoundEnabled);
    playSfx('unlock', isSoundEnabled);
    if (onNext) {
      onNext();
    } else {
      onStartGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 flex flex-col justify-between p-3 sm:p-6 select-none relative overflow-hidden">
      {/* Top Global Navigation Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-2 z-10">
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white/80 hover:bg-white text-amber-900 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          title="첫 화면입니다"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" />
          <span>뒤로가기</span>
        </button>

        <span className="text-xs font-black text-amber-900/70 tracking-wide bg-amber-100/70 px-3 py-1 rounded-full">
          🏰 시작 화면 (Start)
        </span>

        <button
          onClick={handleStart}
          className="px-3.5 py-1.5 rounded-xl border border-amber-400 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black transition flex items-center gap-1.5 active:scale-95 shadow-sm"
          title="게임 플레이 화면으로 앞으로가기"
        >
          <span>앞으로가기 (시작)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Decorative Cloud & Star Elements */}
      <div className="absolute top-12 left-10 text-4xl text-amber-200/60 animate-pulse pointer-events-none">
        ☁️
      </div>
      <div className="absolute top-20 right-16 text-3xl text-amber-300/70 animate-bounce pointer-events-none">
        ⭐
      </div>
      <div className="absolute bottom-24 left-8 text-4xl text-emerald-200/60 pointer-events-none">
        🌳
      </div>

      {/* Main Container */}
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col items-center justify-center my-2">
        {/* Top Grade / Level Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/40 text-amber-900 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black mb-3 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>초등 3~4학년 퀘스트형 생활 영어 게임</span>
          <span className="bg-amber-500 text-white text-[11px] px-2 py-0.5 rounded-full">CEFR Pre-A1~A1</span>
        </div>

        {/* Big Game Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-3xl shadow-lg border-2 border-amber-300 mb-2 transform -rotate-1 hover:rotate-0 transition">
            <span className="text-4xl sm:text-5xl">🏰</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-amber-950 tracking-tight drop-shadow-xs">
            English Quest Town
          </h1>
          <p className="text-amber-800/90 text-sm sm:text-base font-semibold mt-1">
            마을 속 장소를 탐험하며 진짜 쓰이는 생활 영어를 정복하자!
          </p>
        </div>

        {/* Interactive Town Map Overview Cards (HOME -> SCHOOL -> MARKET) */}
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="bg-white/90 border-2 border-amber-300 rounded-2xl p-3 text-center shadow-xs">
            <div className="text-3xl sm:text-4xl mb-1">🏠</div>
            <div className="font-extrabold text-amber-900 text-xs sm:text-sm">1. HOME</div>
            <div className="text-[11px] text-amber-700 font-medium">기상과 아침 식사</div>
            <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">5 퀘스트</span>
          </div>

          <div className="bg-white/90 border-2 border-emerald-300 rounded-2xl p-3 text-center shadow-xs">
            <div className="text-3xl sm:text-4xl mb-1">🏫</div>
            <div className="font-extrabold text-emerald-900 text-xs sm:text-sm">2. SCHOOL</div>
            <div className="text-[11px] text-emerald-700 font-medium">학용품과 수업 지시</div>
            <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">5 퀘스트</span>
          </div>

          <div className="bg-white/90 border-2 border-sky-300 rounded-2xl p-3 text-center shadow-xs">
            <div className="text-3xl sm:text-4xl mb-1">🛒</div>
            <div className="font-extrabold text-sky-900 text-xs sm:text-sm">3. MARKET</div>
            <div className="text-[11px] text-sky-700 font-medium">과일과 쇼핑 표현</div>
            <span className="inline-block mt-1 text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">5 퀘스트</span>
          </div>
        </div>

        {/* Player Character Selection & Audio Test */}
        <div className="w-full bg-white/95 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-md mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                <span>🎒</span> 나의 탐험가 캐릭터 선택
              </h2>
              <p className="text-xs text-amber-800/80">퀘스트를 함께 떠날 마스코트를 골라보세요!</p>
            </div>

            {/* Speaker Sound Test */}
            <button
              onClick={handleAudioTest}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition shadow-xs ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>{isPlayingAudio ? '영어 음성 재생 중...' : '영어 발음 소리 시험'}</span>
            </button>
          </div>

          {/* Avatar Cards */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => {
                    playSfx('click', isSoundEnabled);
                    setSelectedAvatar(avatar.id);
                  }}
                  className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-md scale-105'
                      : 'bg-gray-50/80 border-gray-200 hover:bg-amber-50/50 hover:border-amber-200'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl mb-1">{avatar.emoji}</span>
                  <span className="font-extrabold text-xs text-amber-950">{avatar.name}</span>
                  <span className="text-[10px] text-gray-500 hidden sm:inline">{avatar.title}</span>
                </button>
              );
            })}
          </div>

          {/* Name Input */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 shrink-0">탐험가 이름:</span>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={10}
              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-bold text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Big [게임 시작] Button (화면 중앙 하단, 큰 글씨 as per PRD) */}
        <div className="w-full flex flex-col items-center">
          <button
            onClick={handleStart}
            className="w-full sm:w-80 py-4 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-3xl shadow-xl hover:shadow-2xl border-b-4 border-amber-700 font-black text-xl sm:text-2xl tracking-wider flex items-center justify-center gap-3 transition transform active:translate-y-1 active:border-b-2 active:scale-98"
          >
            <Play className="w-7 h-7 fill-white" />
            <span>게임 시작</span>
          </button>
          <span className="text-xs font-bold text-amber-800/80 mt-2">
            총 3개 맵 • 15개 필수 퀘스트 • 즉각 음성 피드백
          </span>
        </div>
      </div>

      {/* Footer information */}
      <footer className="text-center py-2 text-xs text-amber-900/60 font-medium">
        초등 3~4학년 영어과 교육과정 연계 • Pre-A1 ~ A1 생활 영어 단어 및 지시문
      </footer>
    </div>
  );
};
