"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RobotAvatar = ({ isSpeaking, size = 150 }) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Calculate responsive size based on viewport width
  const calculateResponsiveSize = () => {
    // Base size as percentage of viewport width with min/max constraints
    if (typeof window === 'undefined') return size; // SSR fallback
    
    const viewportWidth = window.innerWidth;
    let responsiveSize = size;
    
    if (viewportWidth < 640) { // mobile
      responsiveSize = Math.min(120, Math.max(80, viewportWidth * 0.25));
    } else if (viewportWidth < 1024) { // tablet
      responsiveSize = Math.min(150, Math.max(100, viewportWidth * 0.15));
    } else { // desktop
      responsiveSize = Math.min(180, Math.max(150, viewportWidth * 0.1));
    }
    
    return responsiveSize;
  };
  
  const [responsiveSize, setResponsiveSize] = useState(size);
  
  // Initialize animation after component mount and handle resize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 300);
    
    // Setup blinking interval
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
      clearTimeout(timer);
      clearInterval(blinkingInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Convert size to inline styles instead of dynamic classnames
  const getSize = (multiplier = 1) => {
    return {
      width: `${responsiveSize * multiplier}px`,
      height: `${responsiveSize * multiplier}px`
    };
  };

  // Framer Motion variants
  const robotVariants = {
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
  
  // Pulsing animation for when robot is speaking
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
      className="flex flex-col items-center relative"
      initial="hidden"
      animate="visible"
      variants={robotVariants}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-label={isSpeaking ? "MockMate AI robot is speaking" : "MockMate AI robot"}
    >
      {/* Robot Avatar Container */}
      <motion.div 
        className="relative flex flex-col items-center justify-start"
        animate={isSpeaking ? "speaking" : "idle"}
        variants={pulseVariants}
        style={getSize(1.2)}
      >
        {/* Avatar Glow Effect */}
        <motion.div 
          className={`absolute rounded-full bg-indigo-500/30 filter blur-md z-0`}
          animate={{ 
            scale: isSpeaking ? [1, 1.1, 1] : 1,
            opacity: isSpeaking ? [0.3, 0.5, 0.3] : 0.3
          }}
          transition={{ 
            repeat: isSpeaking ? Infinity : 0,
            duration: 2
          }}
          style={{
            ...getSize(isSpeaking ? 1.1 : 0.9),
            top: `${responsiveSize * 0.05}px`
          }}
        />
        
        {/* Robot Head */}
        <motion.div 
          className="relative bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl shadow-lg overflow-hidden z-10"
          animate={{ 
            boxShadow: isSpeaking 
              ? '0 8px 16px rgba(79, 70, 229, 0.4)' 
              : '0 4px 8px rgba(79, 70, 229, 0.3)'
          }}
          style={getSize(0.8)}
        >
          {/* Antenna */}
          <div className="absolute w-2 h-6 bg-gradient-to-t from-indigo-400 to-indigo-300 -top-[18px] rounded left-1/2 -ml-1 shadow-indigo-300/50 z-10">
            <motion.div 
              className="absolute w-3 h-3 bg-white rounded-full -top-[6px] -left-[2px] shadow-white/80"
              animate={{ 
                opacity: [1, 0.4, 1],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                repeat: Infinity,
                duration: isSpeaking ? 0.8 : 1.5
              }}
            />
          </div>
          
          {/* Face */}
          <div className="w-full h-full flex flex-col items-center justify-center p-5">
            {/* Eyes */}
            <div className="flex justify-around w-4/5 mb-6">
              {/* Left Eye */}
              <motion.div 
                className="relative bg-white rounded-full shadow-inner overflow-hidden"
                animate={isBlinking ? "blinking" : "open"}
                variants={eyeVariants}
                transition={isBlinking ? { duration: 0.15 } : { duration: 0.2 }}
                style={getSize(0.16)}
              >
                <motion.div 
                  className="absolute bg-gray-900 rounded-full" 
                  style={{
                    ...getSize(0.08),
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </motion.div>
              
              {/* Right Eye */}
              <motion.div 
                className="relative bg-white rounded-full shadow-inner overflow-hidden"
                animate={isBlinking ? "blinking" : "open"}
                variants={eyeVariants}
                transition={isBlinking ? { duration: 0.15 } : { duration: 0.2 }}
                style={getSize(0.16)}
              >
                <motion.div 
                  className="absolute bg-gray-900 rounded-full"
                  style={{
                    ...getSize(0.08),
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </motion.div>
            </div>
            
            {/* Mouth */}
            <motion.div 
              className="bg-white/15 rounded-full flex justify-around items-center px-1.5 overflow-hidden shadow-inner"
              animate={{ 
                height: isSpeaking ? `${responsiveSize * 0.12}px` : `${responsiveSize * 0.1}px`,
                backgroundColor: isSpeaking ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)'
              }}
              style={{ width: `${responsiveSize * 0.5}px` }}
            >
              {isSpeaking && (
                <>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.div 
                      key={i}
                      className="bg-white rounded-full opacity-80"
                      animate={{ 
                        height: [`${20}%`, `${80}%`, `${20}%`]
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.08,
                        ease: "easeInOut"
                      }}
                      style={{ width: `${responsiveSize * 0.01}px` }}
                    />
                  ))}
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Robot Body */}
        <motion.div 
          className="relative bg-gradient-to-b from-indigo-700 to-indigo-800 shadow-md z-0 overflow-hidden flex justify-center"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ 
            width: `${responsiveSize * 0.6}px`, 
            height: `${responsiveSize * 0.3}px`,
            marginTop: `-${responsiveSize * 0.05}px`,
            borderRadius: `0 0 ${responsiveSize * 0.2}px ${responsiveSize * 0.2}px`
          }}
        >
          {/* Body Accent */}
          <div 
            className="absolute bg-indigo-900 rounded-md"
            style={{ 
              width: `${responsiveSize * 0.4}px`, 
              height: `${responsiveSize * 0.06}px`,
              top: `${responsiveSize * 0.06}px`
            }}
          />
          
          {/* Robot Badge */}
          <motion.div 
            className="absolute bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow border-2 border-white/30"
            animate={{ 
              rotate: isSpeaking ? [0, 5, -5, 0] : 0,
              scale: isSpeaking ? [1, 1.05, 1] : 1
            }}
            transition={{ 
              repeat: isSpeaking ? Infinity : 0,
              duration: 2
            }}
            style={{ 
              width: `${responsiveSize * 0.16}px`, 
              height: `${responsiveSize * 0.16}px`,
              top: `${responsiveSize * 0.15}px`
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2a1 1 0 0 1 .996.936l.018.14.186 2.23a1 1 0 0 1-.56.917c-.439.262-.669.652-.743 1.163a4.981 4.981 0 0 0 0 .368c.074.511.304.9.743 1.163a1 1 0 0 1 .56.916l-.186 2.232a1 1 0 0 1-1.014 1.076l-.132-.012a1 1 0 0 1-.867-1.123l.011-.11.133-1.603-.95.063a1 1 0 0 1-1.506-.996c.017-.171.062-.338.134-.495-1.09-1.041-1.09-2.733 0-3.775a1.736 1.736 0 0 1-.134-.495 1 1 0 0 1 1.506-.997l.95.063-.133-1.6a1 1 0 0 1 2.012-.12Z" fill="white" />
              <path d="M15.6 12a1 1 0 0 1 .113 1.993l-.113.007H8.4a1 1 0 0 1-.113-1.993L8.4 12h7.2Z" fill="white" />
              <path d="M14.4 16a1 1 0 0 1 .117 1.993L14.4 18H9.6a1 1 0 0 1-.117-1.993L9.6 16h4.8Z" fill="white" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Robot Label */}
      <motion.div 
        className="mt-2 sm:mt-4 flex items-center gap-1 sm:gap-2 flex-wrap justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="font-bold text-base sm:text-xl text-indigo-700 dark:text-indigo-400 tracking-wide">MockMate</span>
        <motion.span 
          className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white text-xs font-bold py-0.5 px-1.5 rounded shadow-sm shadow-indigo-500/30"
          animate={{ 
            boxShadow: isSpeaking 
              ? '0 2px 4px rgba(79, 70, 229, 0.4)' 
              : '0 1px 2px rgba(79, 70, 229, 0.3)'
          }}
        >
          AI
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default RobotAvatar;