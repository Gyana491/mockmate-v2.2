"use client";

import { useState, useEffect } from "react";

export default function UserAvatar({ isSpeaking, size = 120 }) {
  const [colors] = useState({
    skin: "#F8D5C2",
    hair: "#5A3825",
    outfit: "#22C55E"
  });

  const avatarSize = size;
  const headSize = size * 0.8;
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className={`relative ${isSpeaking ? "animate-subtle-bounce" : ""}`}>
        {/* Head */}
        <div 
          className="rounded-full shadow-md"
          style={{ 
            width: headSize, 
            height: headSize, 
            backgroundColor: colors.skin 
          }}
        >
          {/* Hair */}
          <div 
            className="absolute rounded-t-full"
            style={{ 
              width: headSize, 
              height: headSize / 2, 
              backgroundColor: colors.hair,
              top: -5, 
              clipPath: "polygon(0 0, 100% 0, 100% 60%, 0 60%)" 
            }}
          ></div>
          
          {/* Eyes */}
          <div 
            className="absolute bg-white rounded-full"
            style={{ 
              width: headSize / 10, 
              height: headSize / 5, 
              top: headSize * 0.35, 
              left: headSize * 0.25, 
              transform: "rotate(5deg)" 
            }}
          >
            <div 
              className="absolute bg-black rounded-full" 
              style={{ 
                width: headSize / 20, 
                height: headSize / 20, 
                top: headSize / 20, 
                left: headSize / 40 
              }}
            ></div>
          </div>
          <div 
            className="absolute bg-white rounded-full"
            style={{ 
              width: headSize / 10, 
              height: headSize / 5, 
              top: headSize * 0.35, 
              right: headSize * 0.25, 
              transform: "rotate(-5deg)" 
            }}
          >
            <div 
              className="absolute bg-black rounded-full" 
              style={{ 
                width: headSize / 20, 
                height: headSize / 20, 
                top: headSize / 20, 
                right: headSize / 40 
              }}
            ></div>
          </div>
          
          {/* Mouth - changes when speaking */}
          {isSpeaking ? (
            <div 
              className="absolute bg-red-500 rounded-full animate-pulse"
              style={{ 
                width: headSize / 4, 
                height: headSize / 8, 
                bottom: headSize * 0.2, 
                left: "50%", 
                transform: "translateX(-50%)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" 
              }}
            ></div>
          ) : (
            <div 
              className="absolute bg-red-400 rounded-full"
              style={{ 
                width: headSize / 5, 
                height: headSize / 16, 
                bottom: headSize * 0.22, 
                left: "50%", 
                transform: "translateX(-50%)" 
              }}
            ></div>
          )}
        </div>
        
        {/* Body/Outfit */}
        <div 
          className="absolute rounded-t-lg"
          style={{ 
            width: headSize * 0.9, 
            height: headSize / 2, 
            backgroundColor: colors.outfit, 
            bottom: -headSize / 7,
            left: "50%",
            transform: "translateX(-50%)"
          }}
        ></div>
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