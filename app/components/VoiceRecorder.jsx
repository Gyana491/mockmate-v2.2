"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createSpeechRecognizer } from "../lib/speechRecognition";

export default function VoiceRecorder({ 
  onStop, 
  onRecordingStatusChange, 
  onLiveTranscription,
  disabled = false 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognizerRef = useRef(null);
  const timerRef = useRef(null);

  // Effect to handle timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  // Effect to notify parent component about recording status
  useEffect(() => {
    if (onRecordingStatusChange) {
      onRecordingStatusChange(isRecording, isProcessing);
    }
  }, [isRecording, isProcessing, onRecordingStatusChange]);

  // Start recording
  const startRecording = () => {
    if (disabled || isRecording || isProcessing) return;
    
    setError(null);
    setTranscript("");
    setRecordingTime(0);
    setIsRecording(true);
    
    // Start speech recognition
    recognizerRef.current = createSpeechRecognizer({
      onResult: (text) => {
        setTranscript(text);
        if (onLiveTranscription) {
          onLiveTranscription(text);
        }
      },
      onError: (error) => {
        console.error("Speech recognition error:", error);
        setError("Speech recognition error. Please try again.");
        stopRecording();
      },
      onEnd: () => {
        // This will be called when speech recognition ends
      }
    });
    
    if (!recognizerRef.current) {
      setError("Could not start speech recognition. Please check your browser permissions.");
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    // Stop speech recognition
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }
    
    // Submit the final transcript
    if (onStop && transcript) {
      onStop(transcript);
    }
    
    // Reset after a short delay to show processing state
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {error && (
        <div className="text-xs text-red-500 mb-2 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      
      <div className="relative">
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${
          isRecording 
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        } ${disabled ? 'opacity-60' : ''}`}>
          <button
            className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
              isRecording 
                ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400' 
                : isProcessing
                  ? 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400'
                  : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors duration-200`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <>
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full border-2 border-emerald-500 dark:border-emerald-400"
                ></motion.div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="6" y="6" width="12" height="12" strokeWidth="2" />
                </svg>
              </>
            ) : isProcessing ? (
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
              <span>
                {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Voice Recording'}
              </span>
              {isRecording && (
                <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {formatTime(recordingTime)}
                </span>
              )}
            </div>
            
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {isRecording ? (
                "Speak clearly, click stop when finished"
              ) : isProcessing ? (
                "Processing your answer..."
              ) : disabled ? (
                "Voice recording is unavailable"
              ) : (
                "Click the microphone to start recording"
              )}
            </div>
          </div>
        </div>
        
        {isRecording && (
          <div className="mt-2">
            <div className="animate-pulse flex space-x-1 items-center justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1 bg-emerald-400 dark:bg-emerald-500 rounded-full"
                  style={{
                    height: `${Math.floor(Math.random() * 12) + 6}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}