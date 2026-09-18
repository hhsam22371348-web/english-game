/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MapId, Quest } from './types';
import { QUESTS, MAPS_METADATA } from './data/quests';
import { Header } from './components/Header';
import { MapProgressBar } from './components/MapProgressBar';
import { StartScreen } from './components/StartScreen';
import { GameView } from './components/GameView';
import { MapCompleteModal } from './components/MapCompleteModal';
import { ResultScreen } from './components/ResultScreen';
import { playSfx } from './utils/audio';

type Screen = 'start' | 'game' | 'result';

const STORAGE_KEY = 'english_quest_town_v1';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [playerName, setPlayerName] = useState<string>('민준이');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('toby');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Gameplay Progression State
  const [currentMapId, setCurrentMapId] = useState<MapId>('home');
  const [currentQuestIndex, setCurrentQuestIndex] = useState<number>(0); // 0 to 4
  const [unlockedMaps, setUnlockedMaps] = useState<MapId[]>(['home']);
  const [completedMaps, setCompletedMaps] = useState<MapId[]>([]);
  const [stars, setStars] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState<number>(0);
  const [solvedQuestIds, setSolvedQuestIds] = useState<string[]>([]);
  const [mistakeQuestIds, setMistakeQuestIds] = useState<string[]>([]);

  // Modal State
  const [completedMapForModal, setCompletedMapForModal] = useState<MapId | null>(null);
  const [nextMapForModal, setNextMapForModal] = useState<MapId | null>(null);

  // Filter quests for active map
  const mapQuests = QUESTS.filter((q) => q.mapId === currentMapId);
  const currentQuest = mapQuests[currentQuestIndex] || mapQuests[0];

  // Load saved state if available on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.playerName) setPlayerName(data.playerName);
        if (data.selectedAvatar) setSelectedAvatar(data.selectedAvatar);
        if (Array.isArray(data.unlockedMaps) && data.unlockedMaps.length > 0) {
          setUnlockedMaps(data.unlockedMaps);
        }
        if (Array.isArray(data.completedMaps)) {
          setCompletedMaps(data.completedMaps);
        }
        if (typeof data.stars === 'number') setStars(data.stars);
        if (typeof data.coins === 'number') setCoins(data.coins);
        if (typeof data.firstTryCorrectCount === 'number') {
          setFirstTryCorrectCount(data.firstTryCorrectCount);
        }
        if (Array.isArray(data.mistakeQuestIds)) {
          setMistakeQuestIds(data.mistakeQuestIds);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    try {
      const data = {
        playerName,
        selectedAvatar,
        unlockedMaps,
        completedMaps,
        stars,
        coins,
        firstTryCorrectCount,
        mistakeQuestIds,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [
    playerName,
    selectedAvatar,
    unlockedMaps,
    completedMaps,
    stars,
    coins,
    firstTryCorrectCount,
    mistakeQuestIds,
  ]);

  const handleStartGame = () => {
    setScreen('game');
  };

  const handleToggleSound = () => {
    setIsSoundEnabled((prev) => !prev);
  };

  const handleGoHome = () => {
    setScreen('start');
  };

  const handleAnswerComplete = (questId: string, isFirstTryCorrect: boolean) => {
    // Increment stars & coins
    setStars((prev) => prev + 1);
    setCoins((prev) => prev + 10);

    if (!solvedQuestIds.includes(questId)) {
      setSolvedQuestIds((prev) => [...prev, questId]);
    }

    if (isFirstTryCorrect) {
      setFirstTryCorrectCount((prev) => prev + 1);
    } else {
      if (!mistakeQuestIds.includes(questId)) {
        setMistakeQuestIds((prev) => [...prev, questId]);
      }
    }
  };

  const handleNextQuest = () => {
    if (currentQuestIndex < 4) {
      // Move to next quest in same map
      setCurrentQuestIndex((prev) => prev + 1);
    } else {
      // Completed all 5 quests in current map!
      const isHome = currentMapId === 'home';
      const isSchool = currentMapId === 'school';
      const isMarket = currentMapId === 'market';

      if (!completedMaps.includes(currentMapId)) {
        setCompletedMaps((prev) => [...prev, currentMapId]);
      }

      if (isHome) {
        // Unlock SCHOOL
        if (!unlockedMaps.includes('school')) {
          setUnlockedMaps((prev) => [...prev, 'school']);
        }
        setCompletedMapForModal('home');
        setNextMapForModal('school');
      } else if (isSchool) {
        // Unlock MARKET
        if (!unlockedMaps.includes('market')) {
          setUnlockedMaps((prev) => [...prev, 'market']);
        }
        setCompletedMapForModal('school');
        setNextMapForModal('market');
      } else if (isMarket) {
        // Final Market cleared! All 3 maps finished!
        setCompletedMapForModal('market');
        setNextMapForModal(null);
      }
    }
  };

  const handleContinueFromModal = () => {
    if (nextMapForModal) {
      setCurrentMapId(nextMapForModal);
      setCurrentQuestIndex(0);
      setCompletedMapForModal(null);
      setNextMapForModal(null);
    } else {
      // Completed final map -> to Result screen
      setCompletedMapForModal(null);
      setScreen('result');
    }
  };

  const handleViewResults = () => {
    setCompletedMapForModal(null);
    setScreen('result');
  };

  const handleSelectMap = (mapId: MapId) => {
    if (unlockedMaps.includes(mapId)) {
      setCurrentMapId(mapId);
      setCurrentQuestIndex(0);
      setScreen('game');
    }
  };

  // Comprehensive Backward Navigation across all screens
  const handlePrev = () => {
    playSfx('click', isSoundEnabled);
    if (screen === 'start') {
      // Already at first screen
      return;
    }
    if (screen === 'game') {
      if (currentQuestIndex > 0) {
        setCurrentQuestIndex((prev) => prev - 1);
      } else {
        // At quest index 0: go to previous map if any, or back to start screen
        if (currentMapId === 'market') {
          setCurrentMapId('school');
          setCurrentQuestIndex(4);
        } else if (currentMapId === 'school') {
          setCurrentMapId('home');
          setCurrentQuestIndex(4);
        } else {
          setScreen('start');
        }
      }
      return;
    }
    if (screen === 'result') {
      // Go back to the game view
      setScreen('game');
      return;
    }
  };

  // Comprehensive Forward Navigation across all screens
  const handleNext = () => {
    playSfx('click', isSoundEnabled);
    if (screen === 'start') {
      setScreen('game');
      return;
    }
    if (screen === 'game') {
      if (currentQuestIndex < 4) {
        setCurrentQuestIndex((prev) => prev + 1);
      } else {
        handleNextQuest();
      }
      return;
    }
    if (screen === 'result') {
      setScreen('start');
      return;
    }
  };

  const handleRestart = () => {
    // Reset progression for a fresh run
    setCurrentMapId('home');
    setCurrentQuestIndex(0);
    setStars(0);
    setCoins(0);
    setFirstTryCorrectCount(0);
    setSolvedQuestIds([]);
    setMistakeQuestIds([]);
    setUnlockedMaps(['home']);
    setCompletedMaps([]);
    setScreen('game');
  };

  // Find mistake quest objects for the review screen
  const mistakeQuestsList: Quest[] = mistakeQuestIds
    .map((id) => QUESTS.find((q) => q.id === id))
    .filter((q): q is Quest => Boolean(q));

  return (
    <div className="min-h-screen bg-amber-50/40 text-gray-900 flex flex-col font-sans">
      {/* 1. START SCREEN */}
      {screen === 'start' && (
        <StartScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          selectedAvatar={selectedAvatar}
          setSelectedAvatar={setSelectedAvatar}
          onStartGame={handleStartGame}
          isSoundEnabled={isSoundEnabled}
          onPrev={undefined}
          onNext={handleNext}
        />
      )}

      {/* 2. GAME SCREEN (HOME, SCHOOL, MARKET) */}
      {screen === 'game' && currentQuest && (
        <div className="flex-1 flex flex-col">
          {/* Header with Star (left), Quest 3/5 (center), Coin (right) & Prev/Next */}
          <Header
            currentMapId={currentMapId}
            currentQuestNumber={currentQuestIndex + 1}
            totalQuestsInMap={5}
            stars={stars}
            coins={coins}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={handleToggleSound}
            onGoHome={handleGoHome}
            unlockedMaps={unlockedMaps}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={true}
            hasNext={true}
          />

          <main className="flex-1 max-w-4xl mx-auto w-full px-3 py-3 flex flex-col gap-3">
            {/* Map sequential progress bar (HOME -> SCHOOL -> MARKET) */}
            <MapProgressBar
              currentMapId={currentMapId}
              unlockedMaps={unlockedMaps}
              completedMaps={completedMaps}
              onSelectMap={handleSelectMap}
            />

            {/* Active Quest Interaction Component with Forward & Backward Navigation */}
            <GameView
              quest={currentQuest}
              currentQuestIndex={currentQuestIndex}
              totalQuestsInMap={5}
              isSoundEnabled={isSoundEnabled}
              onAnswerComplete={handleAnswerComplete}
              onNextQuest={handleNextQuest}
              onPrevQuest={handlePrev}
              hasPrev={true}
              hasNext={true}
            />
          </main>

          {/* Map Complete Celebration Modal */}
          {completedMapForModal && (
            <MapCompleteModal
              completedMapId={completedMapForModal}
              nextMapId={nextMapForModal}
              isSoundEnabled={isSoundEnabled}
              onContinue={handleContinueFromModal}
              onViewResults={handleViewResults}
            />
          )}
        </div>
      )}

      {/* 3. RESULT SCREEN */}
      {screen === 'result' && (
        <ResultScreen
          stars={stars}
          coins={coins}
          firstTryCorrectCount={firstTryCorrectCount}
          totalQuests={15}
          completedMaps={completedMaps}
          mistakeQuests={mistakeQuestsList}
          playerName={playerName}
          isSoundEnabled={isSoundEnabled}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
          onSelectMapToPlay={handleSelectMap}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
