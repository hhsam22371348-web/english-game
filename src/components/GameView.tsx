import React, { useState, useEffect } from 'react';
import {
  Volume2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Mic,
} from 'lucide-react';
import { Quest, MapId } from '../types';
import { TownScenery } from './TownScenery';
import { VoiceRecorder } from './VoiceRecorder';
import { playSfx, speakEnglish } from '../utils/audio';

interface GameViewProps {
  quest: Quest;
  currentQuestIndex: number; // 0 to 4
  totalQuestsInMap: number; // 5
  isSoundEnabled: boolean;
  onAnswerComplete: (questId: string, isFirstTryCorrect: boolean) => void;
  onNextQuest: () => void;
  onPrevQuest: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const GameView: React.FC<GameViewProps> = ({
  quest,
  currentQuestIndex,
  totalQuestsInMap,
  isSoundEnabled,
  onAnswerComplete,
  onNextQuest,
  onPrevQuest,
  hasPrev,
  hasNext,
}) => {
  // Local interaction state for current quest
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [scrambleAnswer, setScrambleAnswer] = useState<string[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [showOptionalRecorder, setShowOptionalRecorder] = useState<boolean>(false);

  // Auto-play English NPC audio when a new quest loads
  useEffect(() => {
    setSelectedChoiceId(null);
    setScrambleAnswer([]);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
    setShowTranslation(false);
    setAttemptCount(0);

    // Auto speak audio with slight delay for page transition
    const timer = setTimeout(() => {
      handlePlaySpeech();
    }, 400);

    return () => clearTimeout(timer);
  }, [quest.id]);

  const handlePlaySpeech = (customText?: string) => {
    const textToSpeak = customText || quest.npcSpeech;
    setIsPlayingAudio(true);
    speakEnglish(textToSpeak, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Multiple choice click handler
  const handleSelectChoice = (choiceId: string) => {
    if (isAnswerSubmitted && isCorrect) return; // already finished
    playSfx('click', isSoundEnabled);
    setSelectedChoiceId(choiceId);

    const chosen = quest.choices?.find((c) => c.id === choiceId);
    const correct = Boolean(chosen?.isCorrect);
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);

    if (correct) {
      setIsCorrect(true);
      setIsAnswerSubmitted(true);
      playSfx('correct', isSoundEnabled);
      playSfx('star', isSoundEnabled);
      playSfx('coin', isSoundEnabled);
      onAnswerComplete(quest.id, newAttempt === 1);
    } else {
      setIsCorrect(false);
      setIsAnswerSubmitted(true);
      setShowHint(true);
      playSfx('wrong', isSoundEnabled);
    }
  };

  // Scramble word click handlers
  const handleAddScrambleWord = (word: string, index: number) => {
    if (isAnswerSubmitted && isCorrect) return;
    playSfx('click', isSoundEnabled);
    setScrambleAnswer((prev) => [...prev, word]);
  };

  const handleRemoveScrambleWord = (removeIndex: number) => {
    if (isAnswerSubmitted && isCorrect) return;
    playSfx('click', isSoundEnabled);
    setScrambleAnswer((prev) => prev.filter((_, i) => i !== removeIndex));
  };

  const handleResetScramble = () => {
    playSfx('click', isSoundEnabled);
    setScrambleAnswer([]);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
  };

  const handleCheckScramble = () => {
    if (scrambleAnswer.length === 0) return;
    const currentBuiltSentence = scrambleAnswer.join(' ').trim();
    const targetSentence = (quest.correctSentence || '').trim();

    // Flexible match ignoring trailing punctuation differences if any
    const cleanCurrent = currentBuiltSentence.replace(/[.?!,]/g, '').toLowerCase();
    const cleanTarget = targetSentence.replace(/[.?!,]/g, '').toLowerCase();

    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);

    if (cleanCurrent === cleanTarget || currentBuiltSentence === targetSentence) {
      setIsCorrect(true);
      setIsAnswerSubmitted(true);
      playSfx('correct', isSoundEnabled);
      playSfx('star', isSoundEnabled);
      playSfx('coin', isSoundEnabled);
      onAnswerComplete(quest.id, newAttempt === 1);
    } else {
      setIsCorrect(false);
      setIsAnswerSubmitted(true);
      setShowHint(true);
      playSfx('wrong', isSoundEnabled);
    }
  };

  // Voice recording success handler
  const handleVoiceSuccess = () => {
    if (isAnswerSubmitted && isCorrect) return;
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);
    setIsCorrect(true);
    setIsAnswerSubmitted(true);
    playSfx('correct', isSoundEnabled);
    playSfx('star', isSoundEnabled);
    playSfx('coin', isSoundEnabled);
    onAnswerComplete(quest.id, newAttempt === 1);
  };

  // Remaining available words for sentence building
  const getAvailableScrambleWords = () => {
    if (!quest.scrambleWords) return [];
    const usedCounts: Record<string, number> = {};
    scrambleAnswer.forEach((w) => {
      usedCounts[w] = (usedCounts[w] || 0) + 1;
    });

    return quest.scrambleWords.filter((w) => {
      if (!usedCounts[w]) return true;
      usedCounts[w]--;
      return false;
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-3 flex flex-col gap-4">
      {/* Cartoon Town Scenery for Location Context */}
      <TownScenery mapId={quest.mapId} />

      {/* Quest Title & Scenario Card with Quick Navigation */}
      <div className="bg-white/90 border border-amber-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full">
              Quest {currentQuestIndex + 1}
            </span>
            <h2 className="text-base sm:text-lg font-black text-amber-950">
              {quest.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/80 mt-1 font-medium">
            {quest.scenario}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {/* Quick Prev Button */}
          <button
            onClick={() => {
              playSfx('click', isSoundEnabled);
              onPrevQuest();
            }}
            disabled={!hasPrev}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center gap-1 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title="이전 퀘스트로 이동"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">이전</span>
          </button>

          {/* Quick Next Button */}
          <button
            onClick={() => {
              playSfx('click', isSoundEnabled);
              onNextQuest();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center gap-1 active:scale-95"
            title="다음 퀘스트로 이동"
          >
            <span className="hidden sm:inline">다음</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{showTranslation ? '번역 숨기기' : '번역 보기'}</span>
          </button>
        </div>
      </div>

      {/* NPC Character & Speech Bubble Area */}
      <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-2 border-amber-300 rounded-3xl p-3 sm:p-5 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* NPC Avatar Card */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl border-2 border-amber-400 shadow-md flex items-center justify-center text-4xl sm:text-5xl transform hover:scale-105 transition">
            {quest.npcAvatar}
          </div>
          <span className="font-extrabold text-xs sm:text-sm text-amber-950 mt-1.5">
            {quest.npcName}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold">{quest.npcRole}</span>
        </div>

        {/* Speech Bubble with prominent [스피커 다시 듣기] Button */}
        <div className="flex-1 w-full bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-amber-200 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] font-bold text-amber-600 tracking-wide block mb-1">
                🗣️ 캐릭터의 영어 한마디:
              </span>
              <p className="text-base sm:text-xl font-black text-amber-950 leading-snug">
                "{quest.npcSpeech}"
              </p>

              {/* Korean translation toggle */}
              {showTranslation && (
                <div className="mt-2 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200 flex items-center gap-1.5 animate-fadeIn">
                  <span>🇰🇷</span> {quest.npcSpeechKorean}
                </div>
              )}
            </div>

            {/* Prominent [스피커 다시 듣기] Button next to speech bubble as required in PRD */}
            <button
              onClick={() => handlePlaySpeech()}
              disabled={isPlayingAudio}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white animate-pulse ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
              }`}
              title="원어민 발음 다시 듣기"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span className="whitespace-nowrap">스피커 다시 듣기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quest Instruction & Interaction Area */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-amber-200 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm sm:text-base font-black text-amber-950">
            {quest.question}
          </h3>
        </div>

        {/* 1. LISTEN & CHOOSE / DIALOGUE CHOICE */}
        {quest.choices && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quest.choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              const isRevealedCorrect = isAnswerSubmitted && choice.isCorrect;
              const isRevealedWrong = isAnswerSubmitted && isSelected && !choice.isCorrect;

              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice.id)}
                  disabled={isAnswerSubmitted && isCorrect}
                  className={`p-3 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 active:scale-98 ${
                    isRevealedCorrect
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 text-emerald-950 shadow-md'
                      : isRevealedWrong
                      ? 'bg-red-50 border-red-400 text-red-950'
                      : isSelected
                      ? 'bg-amber-100 border-amber-500 text-amber-950'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-amber-50/60 hover:border-amber-300 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${choice.text ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl py-1'} filter drop-shadow-xs transition-transform group-hover:scale-110`}>
                      {choice.icon}
                    </span>
                    {(choice.text || choice.subtext) && (
                      <div className="flex flex-col">
                        {choice.text && <span className="font-black text-sm sm:text-base">{choice.text}</span>}
                        {choice.subtext && (
                          <span className="text-xs text-gray-500 font-medium">
                            {choice.subtext}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isRevealedCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : isRevealedWrong ? (
                      <AlertCircle className="w-6 h-6 text-red-500 fill-red-100" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. SENTENCE SCRAMBLE (문장 만들기) */}
        {quest.questionType === 'sentence_scramble' && (
          <div className="flex flex-col gap-4">
            {/* Target Answer Slot */}
            <div className="min-h-16 p-3 sm:p-4 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-300 flex flex-wrap items-center gap-2">
              {scrambleAnswer.length === 0 ? (
                <span className="text-xs sm:text-sm text-amber-700/70 font-bold italic">
                  아래의 단어 블록을 순서대로 터치하여 문장을 만들어보세요!
                </span>
              ) : (
                scrambleAnswer.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    onClick={() => handleRemoveScrambleWord(idx)}
                    disabled={isAnswerSubmitted && isCorrect}
                    className="bg-amber-500 text-white font-black text-sm sm:text-base px-3 py-1.5 rounded-xl shadow-xs hover:bg-amber-600 transition active:scale-95 flex items-center gap-1"
                  >
                    <span>{word}</span>
                    <span className="text-xs opacity-75">✕</span>
                  </button>
                ))
              )}
            </div>

            {/* Available Word Block Pool */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-900 mr-1">단어 블록:</span>
              {getAvailableScrambleWords().map((word, idx) => (
                <button
                  key={`available-${word}-${idx}`}
                  onClick={() => handleAddScrambleWord(word, idx)}
                  disabled={isAnswerSubmitted && isCorrect}
                  className="bg-white border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-50 text-amber-950 font-black text-sm sm:text-base px-3.5 py-2 rounded-xl shadow-xs transition transform hover:-translate-y-0.5 active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Action buttons for Scramble */}
            {!isCorrect && (
              <div className="flex items-center gap-2 self-end mt-1">
                <button
                  onClick={handleResetScramble}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 flex items-center gap-1 transition active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>다시 놓기</span>
                </button>
                <button
                  onClick={handleCheckScramble}
                  disabled={scrambleAnswer.length === 0}
                  className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm shadow-md transition active:scale-95 ${
                    scrambleAnswer.length > 0
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  문장 완성 확인!
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. SPEAK & RECORD (마이크 녹음 발음 문제) */}
        {quest.questionType === 'speak_record' && (
          <div className="flex flex-col gap-3">
            <VoiceRecorder
              targetSentence={quest.targetSpeech || quest.correctSentence || quest.npcSpeech}
              guideKorean={quest.speechGuideKo || quest.npcSpeechKorean}
              isSoundEnabled={isSoundEnabled}
              onSuccess={handleVoiceSuccess}
            />
          </div>
        )}

        {/* FEEDBACK BANNER: When Correct */}
        {isAnswerSubmitted && isCorrect && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <span className="font-black text-emerald-950 text-base sm:text-lg">
                    정답이에요! 대단해요! (Great Job!)
                  </span>
                  <div className="text-xs text-emerald-800 font-bold flex items-center gap-2 mt-0.5">
                    <span>⭐ +1 별 획득</span>
                    <span>•</span>
                    <span>🪙 +10 코인 획득</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Optional Voice Recording practice button */}
                {quest.questionType !== 'speak_record' && (
                  <button
                    onClick={() => setShowOptionalRecorder(!showOptionalRecorder)}
                    className="px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                    title="내 목소리로 직접 발음 녹음해보기"
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                    <span>{showOptionalRecorder ? '녹음기 닫기' : '내 발음 녹음하기'}</span>
                  </button>
                )}

                {/* Vocab speech button */}
                <button
                  onClick={() => handlePlaySpeech(quest.keyVocab.exampleSentence)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-200/80 hover:bg-emerald-300 text-emerald-900 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                  title="핵심 예문 발음 듣기"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">예문 듣기</span>
                </button>
              </div>
            </div>

            {/* Optional Voice Practice area in standard questions */}
            {showOptionalRecorder && quest.questionType !== 'speak_record' && (
              <div className="mt-2 pt-2 border-t border-emerald-200">
                <VoiceRecorder
                  targetSentence={quest.npcSpeech}
                  guideKorean={quest.npcSpeechKorean}
                  isSoundEnabled={isSoundEnabled}
                  minimal
                />
              </div>
            )}

            {/* Explanation card */}
            <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-medium">
              <p className="mb-1">{quest.explanation}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 pt-1 border-t border-emerald-100">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  핵심 단어: <strong className="text-emerald-950">{quest.keyVocab.word}</strong>{' '}
                  ({quest.keyVocab.meaning}) {quest.keyVocab.pronunciation}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK BANNER: When Wrong (Shows Encouraging Hint) */}
        {isAnswerSubmitted && !isCorrect && showHint && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3.5 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <span className="font-black text-amber-950 text-sm">
                  앗, 아쉬워요! 힌트를 보고 다시 도전해볼까요?
                </span>
                <p className="text-xs sm:text-sm text-amber-900 mt-1 font-semibold">
                  {quest.hint}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation: [이전 문제 (뒤로가기)] & [다음 문제 (앞으로가기)] */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Previous Button */}
        <button
          id="btn-prev-quest"
          type="button"
          onClick={() => {
            playSfx('click', isSoundEnabled);
            onPrevQuest();
          }}
          disabled={!hasPrev}
          className="py-3 sm:py-3.5 px-4 sm:px-6 bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-2xl font-black text-xs sm:text-base shadow-sm hover:shadow-md flex items-center gap-1.5 sm:gap-2 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          title="이전 퀘스트로 뒤로가기"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          <span>이전 문제 (뒤로가기)</span>
        </button>

        {/* Next Button */}
        {isAnswerSubmitted && isCorrect ? (
          <button
            id="btn-next-quest"
            type="button"
            onClick={() => {
              playSfx('click', isSoundEnabled);
              onNextQuest();
            }}
            className="py-3 sm:py-3.5 px-5 sm:px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs sm:text-base shadow-lg hover:shadow-xl flex items-center gap-1.5 sm:gap-2 transition transform active:scale-95 animate-bounce"
            title="다음 퀘스트로 앞으로가기"
          >
            <span>다음 문제 (앞으로가기)</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        ) : (
          <button
            id="btn-next-quest-skip"
            type="button"
            onClick={() => {
              playSfx('click', isSoundEnabled);
              onNextQuest();
            }}
            className="py-3 sm:py-3.5 px-4 sm:px-6 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 rounded-2xl font-black text-xs sm:text-base shadow-xs hover:shadow-sm flex items-center gap-1.5 sm:gap-2 transition active:scale-95"
            title="다음 문제로 바로 앞으로가기"
          >
            <span>다음 문제 (앞으로가기)</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </button>
        )}
      </div>
    </div>
  );
};
