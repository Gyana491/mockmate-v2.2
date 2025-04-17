"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSpeechRecognizer } from "../lib/speechRecognition";

export default function VoiceRecorder({ 
  onStop, 
  onRecordingStatusChange, 
  onLiveTranscription,
  disabled
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [visualizerValues, setVisualizerValues] = useState(Array(20).fill(5));
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const finalTranscriptRef = useRef("");
  const micPermissionGranted = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recognitionRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);
  const prevDisabled = useRef(disabled);

  // Set up visualizer animation
  const setupAudioVisualizer = async (stream) => {
    if (!stream) return;
    
    try {
      // Create audio context and connect analyzer
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Function to update visualizer values
      const updateVisualizer = () => {
        if (!analyserRef.current || !isRecording) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Use 20 sample points for the visualizer bars
        const samplePoints = 20;
        const sampledData = Array.from({length: samplePoints}, (_, i) => {
          const index = Math.floor(i * (dataArray.length / samplePoints));
          // Scale values between 5 and 100, with some smoothing
          return Math.max(5, 5 + (dataArray[index] / 255) * 95);
        });
        
        setVisualizerValues(sampledData);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      updateVisualizer();
    } catch (err) {
      console.error("Failed to set up audio visualizer:", err);
    }
  };

  // Clean up visualizer
  const cleanupAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setVisualizerValues(Array(20).fill(5));
  };
  
  // Timer for recording duration
  const startRecordingTimer = () => {
    setRecordingDuration(0);
    
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };
  
  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };
  
  // Format seconds to mm:ss
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (onRecordingStatusChange) {
      onRecordingStatusChange(isRecording, isProcessing);
    }
  }, [isRecording, isProcessing, onRecordingStatusChange]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      cleanupAudioVisualizer();
      stopRecordingTimer();
      
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);
  
  // Show the tooltip briefly when disabled
  useEffect(() => {
    if (disabled) {
      setShowTooltip(true);
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      
      return () => {
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
      };
    }
  }, [disabled]);

  useEffect(() => {
    // Reset the voice recorder when disabled state changes to enabled
    if (!disabled && prevDisabled.current) {
      console.log("VoiceRecorder reset for new question");
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingDuration(0);
      setInterimTranscript('');
      finalTranscriptRef.current = '';
      stopRecordingTimer();
      cleanupAudioVisualizer();
    }
    
    prevDisabled.current = disabled;
  }, [disabled]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micPermissionGranted.current = true;
      mediaStreamRef.current = stream;
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      return false;
    }
  };

  const startRecording = async () => {
    // Reset transcripts
    setInterimTranscript("");
    finalTranscriptRef.current = "";

    // Handle unsupported browsers
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      setIsRecording(false);
      cleanupAudioVisualizer();
      return;
    }

    // Request microphone permission if not already granted
    if (!micPermissionGranted.current) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        alert("Microphone access is required for voice recording. Please allow microphone access and try again.");
        return;
      }
    } else {
      // If we already had permission, request a new stream
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    // Set up audio visualizer with media stream
    await setupAudioVisualizer(mediaStreamRef.current);

    setIsRecording(true);
    setIsProcessing(false);
    startRecordingTimer();

    recognitionRef.current = createSpeechRecognizer({
      onResult: (finalTranscriptPart, interimTranscriptPart, isFinal) => {
        // Update interim transcript for live display
        setInterimTranscript(interimTranscriptPart); 
        
        // Append final parts to the ref
        if (finalTranscriptPart) {
          finalTranscriptRef.current += finalTranscriptPart;
        }

        // Update live transcription prop with the latest interim or final
        if (onLiveTranscription) {
          onLiveTranscription(finalTranscriptRef.current + interimTranscriptPart);
        }
      },
      onEnd: () => {
        console.log("Speech recognition ended.");
        // Only process if we haven't already handled it in stopRecording
        if (isRecording) {
          // If it ended unexpectedly while still recording, try restarting
          console.warn('Speech recognition ended unexpectedly while recording. Restarting...');
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error("Error restarting recognition:", e);
              setIsRecording(false);
              setIsProcessing(false);
              stopRecordingTimer();
              cleanupAudioVisualizer();
            }
          }
        }
        // No need to do anything if recognition ended because we stopped it manually
      },
      onError: (error) => {
        console.error("Speech recognition error:", error);
        setIsRecording(false);
        setIsProcessing(false);
        stopRecordingTimer();
        cleanupAudioVisualizer();
        alert(`Speech recognition error: ${error}. Please try again.`);
      },
      onStart: () => {
        console.log("Speech recognition started.");
      }
    });

    if (recognitionRef.current) {
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true; 

      try {
        recognitionRef.current.start();
      } catch (e) {
         console.error("Error starting speech recognition:", e);
         alert("Failed to start voice recording. Please check permissions or try a different browser.");
         setIsRecording(false);
         stopRecordingTimer();
         cleanupAudioVisualizer();
      }
    } else {
      alert("Speech recognition is not supported or failed to initialize.");
      setIsRecording(false);
      stopRecordingTimer();
      cleanupAudioVisualizer();
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

    setIsRecording(false);
    
    // Capture the current transcript
    const currentTranscript = finalTranscriptRef.current || interimTranscript;
    
    // Stop the recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop(); 
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
      }
    }
    
    // Immediately set processing to false (don't wait for onEnd callback)
    setIsProcessing(false);
    stopRecordingTimer();
    cleanupAudioVisualizer();
    
    // Send the transcript back to parent component
    onStop(currentTranscript);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >

              
              <div className="w-full flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-3 h-3 bg-red-600 rounded-full"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(220, 38, 38, 0.7)",
                        "0 0 0 8px rgba(220, 38, 38, 0)",
                        "0 0 0 0 rgba(220, 38, 38, 0)"
                      ],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  <span className="text-red-600 dark:text-red-400 font-medium text-sm">Recording</span>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">{formatDuration(recordingDuration)}</span>
                </div>
 
              </div>
              
              <motion.button 
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-6 rounded-xl shadow-lg border border-red-700/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                onClick={stopRecording} 
                disabled={isProcessing}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                <span>Stop Recording</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="start"
              className="w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <motion.button 
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-xl shadow-lg border border-blue-700/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  onClick={startRecording} 
                  disabled={isProcessing || disabled}
                  whileHover={!disabled ? { scale: 1.03 } : {}}
                  whileTap={!disabled ? { scale: 0.97 } : {}}
                  onMouseEnter={() => disabled && setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Record Answer</span>
                </motion.button>
                
                <AnimatePresence>
                  {showTooltip && disabled && (
                    <motion.div 
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg z-20 whitespace-nowrap"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      Please wait for the question
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            className="flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium py-2 px-4 rounded-lg w-full max-w-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing your answer...</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}