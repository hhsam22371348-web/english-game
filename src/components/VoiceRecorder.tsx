import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { playSfx, speakEnglish } from '../utils/audio';

interface VoiceRecorderProps {
  targetSentence: string;
  guideKorean?: string;
  isSoundEnabled: boolean;
  onSuccess?: () => void;
  autoPlayTarget?: boolean;
  minimal?: boolean; // small inline recorder mode
}

// Check SpeechRecognition support safely
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition
    : null;

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  targetSentence,
  guideKorean,
  isSoundEnabled,
  onSuccess,
  autoPlayTarget = false,
  minimal = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListeningNative, setIsListeningNative] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up recorded blob URL on unmount or sentence change
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
    };
  }, [recordedAudioUrl]);

  // Reset state when target sentence changes
  useEffect(() => {
    setRecordedAudioUrl(null);
    setTranscript('');
    setHasSubmitted(false);
    setMatchScore(null);
    setErrorMessage(null);
    setIsRecording(false);
  }, [targetSentence]);

  // Audio preview playback control
  const handlePlayRecording = () => {
    if (!recordedAudioUrl) return;
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    const audio = new Audio(recordedAudioUrl);
    audioElementRef.current = audio;
    setIsPlayingRecording(true);
    audio.onended = () => setIsPlayingRecording(false);
    audio.onerror = () => setIsPlayingRecording(false);
    audio.play().catch(() => setIsPlayingRecording(false));
  };

  const handlePlayModel = () => {
    speakEnglish(targetSentence);
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscript('');
    setHasSubmitted(false);
    setMatchScore(null);

    // 1. Setup Web Speech Recognition if available
    if (SpeechRecognitionAPI) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event warning:', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListeningNative(true);
      } catch (e) {
        console.warn('SpeechRecognition failed to start:', e);
      }
    }

    // 2. Setup MediaRecorder for actual voice playback
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      playSfx('click', isSoundEnabled);
    } catch (err: any) {
      console.error('Microphone error:', err);
      // Fallback: If microphone permission is denied or not supported in current environment
      setErrorMessage(
        '마이크 사용 권한이 필요합니다. 마이크 허용 후 다시 시도하거나, 발음 연습 후 확인 버튼을 눌러주세요!'
      );
      // Simulate recording ready so student can still practice and proceed
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    playSfx('click', isSoundEnabled);
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListeningNative(false);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  // Evaluate student's pronunciation
  const handleEvaluatePronunciation = () => {
    playSfx('click', isSoundEnabled);

    // Calculate similarity between recognized text and target
    const cleanTarget = targetSentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const cleanStudent = (transcript || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    let score = 95; // default encouraging score if audio recorded
    if (cleanStudent) {
      const targetWords = cleanTarget.split(/\s+/);
      const studentWords = cleanStudent.split(/\s+/);
      const matched = targetWords.filter((w) => studentWords.includes(w));
      const ratio = matched.length / targetWords.length;
      score = Math.max(70, Math.round(ratio * 100));
    }

    setMatchScore(score);
    setHasSubmitted(true);

    if (score >= 60 || !cleanStudent) {
      playSfx('correct', isSoundEnabled);
      playSfx('star', isSoundEnabled);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <div
      className={`w-full rounded-2xl border-2 transition-all ${
        minimal
          ? 'bg-amber-50/70 border-amber-300 p-3'
          : 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/50 border-amber-300 p-4 sm:p-5 shadow-sm'
      }`}
    >
      {/* Target Speech Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-amber-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Mic className="w-3 h-3" />
              <span>따라 말하고 녹음하기</span>
            </span>
            {guideKorean && (
              <span className="text-xs text-amber-800 font-bold">({guideKorean})</span>
            )}
          </div>
          <p className="text-base sm:text-xl font-black text-amber-950 mt-1">
            "{targetSentence}"
          </p>
        </div>

        {/* Model Voice Play Button */}
        <button
          type="button"
          onClick={handlePlayModel}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black transition flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95"
          title="원어민 발음 먼저 듣기"
        >
          <Volume2 className="w-4 h-4 text-amber-600" />
          <span>원어민 발음 듣기</span>
        </button>
      </div>

      {/* Recording Interaction Controls */}
      <div className="flex flex-col items-center justify-center gap-3 my-2">
        {/* Main Microphone Action Button */}
        {!isRecording ? (
          <button
            type="button"
            id="btn-start-record"
            onClick={startRecording}
            className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
              <Mic className="w-4 h-4 fill-white" />
            </div>
            <span>{recordedAudioUrl ? '다시 녹음하기' : '마이크로 녹음 시작하기'}</span>
          </button>
        ) : (
          <button
            type="button"
            id="btn-stop-record"
            onClick={stopRecording}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-sm sm:text-base shadow-lg transition-all animate-pulse active:scale-95"
          >
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center animate-ping" />
            <span>말하는 중... 터치하여 녹음 끝내기</span>
            <Square className="w-4 h-4 fill-white" />
          </button>
        )}

        {/* Recording Animation Wave */}
        {isRecording && (
          <div className="flex items-center gap-1.5 py-1">
            <div className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-8 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-10 bg-red-500 rounded-full animate-bounce" />
            <div className="w-1.5 h-7 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
            <div className="w-1.5 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.35s]" />
            <span className="text-xs font-black text-red-600 ml-2 animate-pulse">
              마이크에 대고 또박또박 말해보세요! 🎙️
            </span>
          </div>
        )}

        {/* Recognized Transcript Display */}
        {transcript && (
          <div className="bg-white/90 border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-amber-950 font-bold flex items-center gap-2">
            <span className="text-gray-500">인식된 음성:</span>
            <span className="text-emerald-700 underline underline-offset-2">"{transcript}"</span>
          </div>
        )}

        {/* Error / Fallback Notice */}
        {errorMessage && (
          <div className="bg-amber-100 border border-amber-300 rounded-xl p-2.5 text-xs text-amber-900 font-medium flex items-center gap-2 max-w-md text-center">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Review & Listen controls once recorded */}
        {recordedAudioUrl && !isRecording && (
          <div className="w-full flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Play my recording */}
            <button
              type="button"
              onClick={handlePlayRecording}
              disabled={isPlayingRecording}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black border transition flex items-center gap-2 active:scale-95 shadow-xs ${
                isPlayingRecording
                  ? 'bg-amber-200 text-amber-950 border-amber-400 animate-pulse'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              <Play className="w-4 h-4 fill-amber-600 text-amber-600" />
              <span>{isPlayingRecording ? '내 목소리 재생 중...' : '내 목소리 들어보기'}</span>
            </button>

            {/* Check Pronunciation / Complete button */}
            {!hasSubmitted ? (
              <button
                type="button"
                id="btn-evaluate-voice"
                onClick={handleEvaluatePronunciation}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black transition flex items-center gap-2 active:scale-95 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-yellow-200" />
                <span>발음 완성 확인하기! ⭐</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-400 text-emerald-950 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>참 잘했어요! Excellent! 🌟🌟🌟</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
