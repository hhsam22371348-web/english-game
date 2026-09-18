export type MapId = 'home' | 'school' | 'market';

export type QuestType = 'listen_choice' | 'sentence_scramble' | 'dialogue_choice' | 'speak_record';

export interface ChoiceOption {
  id: string;
  text: string;
  subtext?: string;
  icon: string;
  isCorrect: boolean;
}

export interface KeyVocabulary {
  word: string;
  meaning: string;
  pronunciation: string;
  exampleSentence: string;
}

export interface Quest {
  id: string;
  mapId: MapId;
  questNumber: number; // 1 to 5
  title: string;
  scenario: string;
  npcName: string;
  npcRole: string;
  npcAvatar: string;
  npcSpeech: string;
  npcSpeechKorean: string;
  question: string;
  questionType: QuestType;
  choices?: ChoiceOption[];
  scrambleWords?: string[]; // scrambled token list
  correctSentence?: string; // target sentence
  targetSpeech?: string; // target speech sentence for speak_record quests
  speechGuideKo?: string; // Korean pronunciation guide or meaning
  hint: string;
  explanation: string;
  keyVocab: KeyVocabulary;
  soundCue?: string;
}

export interface GameProgress {
  currentMap: MapId;
  currentQuestIndex: number; // 0 to 4
  unlockedMaps: MapId[];
  stars: number;
  coins: number;
  totalAnswered: number;
  firstTryCorrectCount: number;
  history: Record<string, { attempts: number; firstTryCorrect: boolean; solved: boolean }>;
  mistakeQuestIds: string[];
  playerName: string;
  selectedAvatar: string;
  isSoundEnabled: boolean;
}

export interface MapMeta {
  id: MapId;
  nameEn: string;
  nameKo: string;
  icon: string;
  color: string;
  bgGradient: string;
  tagline: string;
  targetWords: string[];
}
