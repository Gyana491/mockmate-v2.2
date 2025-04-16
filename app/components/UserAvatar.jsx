"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const UserAvatar = ({ isSpeaking, size = 150 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [responsiveSize, setResponsiveSize] = useState(size);
  
  // Calculate responsive size based on viewport width
  const calculateResponsiveSize = () => {
    // Base size as percentage of viewport width with min/max constraints
    if (typeof window === 'undefined') return size; // SSR fallback
    
    const viewportWidth = window.innerWidth;
    let calculatedSize = size;
    
    if (viewportWidth < 640) { // mobile
      calculatedSize = Math.min(120, Math.max(80, viewportWidth * 0.25));
    } else if (viewportWidth < 1024) { // tablet
      calculatedSize = Math.min(150, Math.max(100, viewportWidth * 0.15));
    } else { // desktop
      calculatedSize = Math.min(180, Math.max(150, viewportWidth * 0.1));
    }
    
    return calculatedSize;
  };
  
  useEffect(() => {
    setIsLoaded(true);
    
    // Set up blinking animation
    const blinkingInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, Math.random() * 4000 + 2000); // Random interval between 2-6 seconds
    
    // Update size on window resize
    const handleResize = () => {
      setResponsiveSize(calculateResponsiveSize());
    };
    
    // Initial size calculation
    handleResize();
    
    // Set up resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(blinkingInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Avatar animation variants
  const avatarVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    },
    hover: {
      y: -10,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };
  
  // Pulsing animation for when user is speaking
  const pulseVariants = {
    idle: { scale: 1 },
    speaking: { 
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity,
        duration: 2
      }
    }
  };
  
  // Eye blinking variants
  const eyeVariants = {
    open: { scaleY: 1 },
    blinking: { scaleY: 0.2 }
  };

  return (
    <motion.div 
      className="flex flex-col items-center gap-2 sm:gap-3"
      initial="hidden"
      animate="visible"
      variants={avatarVariants}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-label={isSpeaking ? "You are speaking" : "You"}
    >
      <motion.div 
      className="w-24 sm:w-32 h-24 sm:h-32 flex justify-center items-center mb-1 sm:mb-2"
      animate={isSpeaking ? "speaking" : "idle"}
      variants={pulseVariants}
      style={{ width: `${responsiveSize * 0.8}px`, height: `${responsiveSize * 0.8}px` }}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute rounded-2xl bg-blue-400/30 filter blur-md"
          animate={{ 
            scale: isSpeaking ? [1, 1.1, 1] : 1,
            opacity: isSpeaking ? [0.3, 0.5, 0.3] : 0.2
          }}
          transition={{ 
            repeat: isSpeaking ? Infinity : 0,
            duration: 2
          }}
          style={{ width: `${responsiveSize * 0.8}px`, height: `${responsiveSize * 0.8}px` }}
        />
        
        <motion.div 
          className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 shadow-lg relative z-10"
          animate={{ 
            boxShadow: isSpeaking 
              ? '0 16px 24px rgba(59, 130, 246, 0.4)' 
              : '0 8px 16px rgba(59, 130, 246, 0.2)'
          }}
        >
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            {/* Head with dynamic animation */}
            <motion.circle 
              cx="50" 
              cy="38" 
              r="30" 
              fill="#2563EB"
              animate={isHovered ? { 
                scale: [1, 1.02, 1],
                translateY: [0, -1, 0] 
              } : {}}
              transition={{ 
                repeat: isHovered ? Infinity : 0, 
                duration: 2 
              }}
            />
            
            {/* Body with subtle animation */}
            <motion.path 
              d="M25 65 L75 65 L80 100 L20 100 Z" 
              fill="#2563EB"
              animate={isHovered ? { 
                translateY: [0, 1, 0] 
              } : {}}
              transition={{ 
                repeat: isHovered ? Infinity : 0, 
                duration: 2.5,
                delay: 0.2
              }}
            />
            
            {/* Eyes with blinking and looking animation */}
            <motion.g>
              {/* Left eye with centered pupil */}
              <motion.circle 
                cx="38" 
                cy="32" 
                r="4" 
                fill="white"
                animate={isBlinking ? "blinking" : "open"}
                variants={eyeVariants}
                transition={isBlinking ? { duration: 0.15 } : {
                  scaleY: { repeat: Infinity, duration: isSpeaking ? 1.2 : 5 },
                  translateX: { repeat: Infinity, duration: 3 }
                }}
              />
              <motion.circle 
                cx="38" 
                cy="32" 
                r="2" 
                fill="black"
                animate={isBlinking ? { opacity: 0 } : { 
                  opacity: 1,
                  cx: isHovered ? [38, 39, 38] : [38, 38.5, 37.5, 38]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: isHovered ? 1 : 5
                }}
              />
              
              {/* Right eye with centered pupil */}
              <motion.circle 
                cx="62" 
                cy="32" 
                r="4" 
                fill="white"
                animate={isBlinking ? "blinking" : "open"}
                variants={eyeVariants}
                transition={isBlinking ? { duration: 0.15 } : { 
                  scaleY: { repeat: Infinity, duration: isSpeaking ? 1.2 : 5, delay: 0.1 },
                  translateX: { repeat: Infinity, duration: 3, delay: 0.1 }
                }}
              />
              <motion.circle 
                cx="62" 
                cy="32" 
                r="2" 
                fill="black"
                animate={isBlinking ? { opacity: 0 } : { 
                  opacity: 1,
                  cx: isHovered ? [62, 63, 62] : [62, 62.5, 61.5, 62]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: isHovered ? 1 : 5,
                  delay: 0.1
                }}
              />
            </motion.g>
            
            {/* Mouth with speaking animation */}
            <motion.path 
              d={isSpeaking ? "M35 50 Q50 60 65 50" : "M35 50 Q50 55 65 50"} 
              fill="none" 
              stroke="white" 
              strokeWidth="2"
              animate={isSpeaking ? { 
                d: ["M35 50 Q50 60 65 50", "M35 50 Q50 65 65 50", "M35 50 Q50 60 65 50"]
              } : {}}
              transition={{ 
                repeat: isSpeaking ? Infinity : 0,
                duration: 0.6
              }}
            />

            {/* Add a collar/tie for a more professional look */}
            <motion.path 
              d="M45 65 L50 75 L55 65" 
              fill="none" 
              stroke="white" 
              strokeWidth="3"
              animate={isHovered ? { 
                strokeWidth: [3, 3.5, 3] 
              } : {}}
              transition={{ 
                repeat: isHovered ? Infinity : 0, 
                duration: 2 
              }}
            />
          </svg>
          
          {/* Microphone indicator when speaking */}
          {isSpeaking && (
            <motion.div 
              className="absolute bottom-2 right-2 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 0 0 rgba(239, 68, 68, 0.7)',
                  '0 0 0 5px rgba(239, 68, 68, 0)',
                  '0 0 0 0 rgba(239, 68, 68, 0.7)'
                ]
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5
              }}
            >
              <span className="sr-only">Recording in progress</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="flex items-center gap-1 sm:gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="font-semibold text-sm sm:text-base text-blue-600 dark:text-blue-400">You</span>
        {isSpeaking && (
          <motion.span 
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-1.5 sm:px-2 py-0.5 rounded-full"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Speaking...
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UserAvatar;