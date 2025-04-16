// components/MockmateRobot.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { speakText } from "../lib/speechSynthesis";
import { createSpeechRecognizer } from "../lib/speechRecognition";

const MockmateRobot = ({ isSpeaking, currentText, onUserResponse }) => {
  const mouthRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const emojiRef = useRef(null);
  const animationFrameId = useRef(null);
  const blinkInterval = useRef(null);
  const recognizerRef = useRef(null);
  const t = useRef(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    const mouthPath = mouthRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    const emoji = emojiRef.current;

    if (!mouthPath || !leftEye || !rightEye || !emoji) return;

    function blinkEyes() {
      leftEye.style.height = "2px";
      rightEye.style.height = "2px";

      setTimeout(() => {
        if (leftEye && rightEye) {
          leftEye.style.height = "20px";
          rightEye.style.height = "20px";
        }
      }, 200);
    }

    function startBlinking() {
      if (blinkInterval.current) {
        clearInterval(blinkInterval.current);
      }

      setTimeout(blinkEyes, 500);

      blinkInterval.current = setInterval(() => {
        blinkEyes();
      }, Math.random() * 4000 + 2000);
    }

    function stopBlinking() {
      if (blinkInterval.current) {
        clearInterval(blinkInterval.current);
        blinkInterval.current = null;
      }
    }

    function animateMouth() {
      if (!mouthPath) return;

      t.current += 0.1;
      const amplitude = 5;
      const frequency = 0.5;

      const y = amplitude * Math.sin(t.current * frequency);
      mouthPath.setAttribute("d", `M0 10 Q50 ${10 + y}, 100 10`);

      animationFrameId.current = requestAnimationFrame(animateMouth);
    }

    function handleSpeakingChange() {
      if (isSpeaking) {
        if (emoji) emoji.classList.add("talking");

        if (!currentText || currentText.trim() === "") {
          console.warn("No text content available for speech.");
          return;
        }

        if (!animationFrameId.current) {
          t.current = 0;
          animateMouth();
        }

        if (!blinkInterval.current) {
          startBlinking();
        }

        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognizerRef.current) {
          try {
            recognizerRef.current.abort();
          } catch (e) {
            console.error("Error stopping speech recognition:", e);
          }
          recognizerRef.current = null;
        }

        if (voiceEnabled) {
          speakText(currentText, {
            onStart: () => {
              console.log("Speech started");
            },
            onEnd: () => {
              console.log("Speech ended");
              if (emoji) emoji.classList.remove("talking");
              if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
              }
              if (mouthPath) mouthPath.setAttribute("d", "M0 10 L100 10");

              startListening();
            },
            onError: (event) => {
              console.error("Speech error:", event);
              if (emoji) emoji.classList.remove("talking");
              if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
              }
              if (mouthPath) mouthPath.setAttribute("d", "M0 10 L100 10");
            },
          });
        } else {
          setTimeout(() => {
            if (emoji) emoji.classList.remove("talking");
            if (animationFrameId.current) {
              cancelAnimationFrame(animationFrameId.current);
              animationFrameId.current = null;
            }
            if (mouthPath) mouthPath.setAttribute("d", "M0 10 L100 10");

            startListening();
          }, 2000);
        }
      } else {
        if (emoji) emoji.classList.remove("talking");
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
        if (mouthPath) mouthPath.setAttribute("d", "M0 10 L100 10");

        if (!blinkInterval.current) {
          startBlinking();
        }
      }
    }

    function startListening() {
      if (isSpeaking) return;

      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch (e) {
          console.error("Error stopping previous speech recognition:", e);
        }
        recognizerRef.current = null;
      }

      recognizerRef.current = createSpeechRecognizer({
        onResult: (transcript) => {
          if (onUserResponse) onUserResponse(transcript);
        },
        onError: (error) => {
          console.error("Speech recognition error:", error);
        },
        onEnd: () => {
          recognizerRef.current = null;
        },
      });

      if (recognizerRef.current) {
        try {
          recognizerRef.current.start();
        } catch (e) {
          console.error("Error starting speech recognition:", e);
          recognizerRef.current = null;
        }
      }
    }

    startBlinking();
    handleSpeakingChange();

    return () => {
      if (blinkInterval.current) clearInterval(blinkInterval.current);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch (e) {
          console.error("Error stopping speech recognition during cleanup:", e);
        }
        recognizerRef.current = null;
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking, currentText, onUserResponse, voiceEnabled]);

  const handleReread = () => {
    if (currentText && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speakText(currentText, {
        onStart: () => console.log("Re-reading text"),
        onEnd: () => console.log("Re-reading complete"),
      });
    }
  };

  const toggleVoice = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-center relative">
        <div 
          className={`w-[120px] h-[120px] rounded-full bg-blue-500 relative flex justify-center shadow-md transition-transform duration-300 ease-in-out ${
            isSpeaking ? "animate-subtle-bounce" : ""
          }`} 
          ref={emojiRef}
        >
          <div className="relative w-[20px] h-[20px] bg-white rounded-full absolute top-[35px] left-[30px] transition-all duration-100 ease-in-out flex items-center justify-center" ref={leftEyeRef}>
            <div className="absolute w-[10px] h-[10px] bg-black rounded-full"></div>
          </div>
          <div className="relative w-[20px] h-[20px] bg-white rounded-full absolute top-[35px] right-[30px] transition-all duration-100 ease-in-out flex items-center justify-center" ref={rightEyeRef}>
            <div className="absolute w-[10px] h-[10px] bg-black rounded-full"></div>
          </div>
          <svg 
            className="w-[60px] h-[20px] absolute bottom-[30px] stroke-white stroke-[3] fill-none" 
            viewBox="0 0 100 20"
          >
            <path ref={mouthRef} d="M0 10 L100 10" />
          </svg>
        </div>
        <div className="mt-3 font-semibold text-blue-500">MockMate AI</div>
        {currentText && <div className="hidden">{currentText}</div>}

        <div className="flex mt-2 gap-2">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm border ${
              voiceEnabled 
                ? "text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-500 dark:text-blue-300" 
                : "text-gray-500 border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            } hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow dark:hover:bg-gray-700`}
            onClick={toggleVoice}
            title={voiceEnabled ? "Turn voice off" : "Turn voice on"}
            aria-label={voiceEnabled ? "Turn voice off" : "Turn voice on"}
          >
            {voiceEnabled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
              </svg>
            )}
          </button>

          <button
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            onClick={handleReread}
            disabled={!voiceEnabled || !currentText}
            title="Re-read text"
            aria-label="Re-read text"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 1v22h22"></path>
              <path d="M3.51 18a9 9 0 0 1 2.13-9.36L12 2"></path>
              <path d="M15 9l-3-3-3 3"></path>
              <path d="M11.05 12.36a6 6 0 0 0-1.05 3.36 6 6 0 0 0 6 6h2"></path>
              <path d="M21 19l-3 3-3-3"></path>
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes subtle-bounce {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-5px);
          }
        }
        
        .animate-subtle-bounce {
          animation: subtle-bounce 1s infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default MockmateRobot;
