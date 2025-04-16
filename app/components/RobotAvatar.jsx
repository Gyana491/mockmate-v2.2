"use client";

import { useEffect, useRef, useState } from "react";

export default function RobotAvatar({ isSpeaking, size = 120 }) {
  const mouthRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const animationFrameId = useRef(null);
  const blinkInterval = useRef(null);
  const t = useRef(0);

  useEffect(() => {
    const mouthPath = mouthRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!mouthPath || !leftEye || !rightEye) return;

    function blinkEyes() {
      leftEye.style.height = "2px";
      rightEye.style.height = "2px";

      setTimeout(() => {
        if (leftEye && rightEye) {
          leftEye.style.height = `${size / 6}px`;
          rightEye.style.height = `${size / 6}px`;
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

    if (isSpeaking) {
      if (!animationFrameId.current) {
        t.current = 0;
        animateMouth();
      }

      if (!blinkInterval.current) {
        startBlinking();
      }
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (mouthPath) mouthPath.setAttribute("d", "M0 10 L100 10");

      if (!blinkInterval.current) {
        startBlinking();
      }
    }

    return () => {
      if (blinkInterval.current) clearInterval(blinkInterval.current);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isSpeaking, size]);

  const eyeSize = size / 6;
  const faceSize = size;

  return (
    <div className="relative flex flex-col items-center">
      <div 
        className={`rounded-full bg-blue-500 relative flex justify-center shadow-md transition-transform duration-300 ease-in-out ${
          isSpeaking ? "animate-subtle-bounce" : ""
        }`} 
        style={{ width: faceSize, height: faceSize }}
      >
        <div 
          className="relative bg-white rounded-full absolute flex items-center justify-center transition-all duration-100 ease-in-out" 
          ref={leftEyeRef}
          style={{ 
            width: eyeSize, 
            height: eyeSize, 
            top: faceSize * 0.3, 
            left: faceSize * 0.25
          }}
        >
          <div 
            className="absolute bg-black rounded-full"
            style={{ width: eyeSize / 2, height: eyeSize / 2 }}
          ></div>
        </div>
        <div 
          className="relative bg-white rounded-full absolute flex items-center justify-center transition-all duration-100 ease-in-out" 
          ref={rightEyeRef}
          style={{ 
            width: eyeSize, 
            height: eyeSize, 
            top: faceSize * 0.3, 
            right: faceSize * 0.25
          }}
        >
          <div 
            className="absolute bg-black rounded-full"
            style={{ width: eyeSize / 2, height: eyeSize / 2 }}
          ></div>
        </div>
        <svg 
          className="absolute stroke-white stroke-[3] fill-none" 
          viewBox="0 0 100 20"
          style={{
            width: faceSize / 2,
            height: faceSize / 6,
            bottom: faceSize / 4
          }}
        >
          <path ref={mouthRef} d="M0 10 L100 10" />
        </svg>
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
}