"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ScoreSection({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    // Animate the score from 0 to the actual value
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          const next = Math.min(prev + 1, score);
          if (next >= score) clearInterval(interval);
          return next;
        });
      }, 20);
      
      return () => clearInterval(interval);
    }, 500); // Small delay before starting animation
    
    return () => clearTimeout(timer);
  }, [score]);
  
  const getScoreColor = (value) => {
    if (value >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (value >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };
  
  const getScoreMessage = (value) => {
    if (value >= 90) return 'Outstanding';
    if (value >= 80) return 'Excellent';
    if (value >= 70) return 'Good';
    if (value >= 60) return 'Satisfactory';
    if (value >= 50) return 'Needs Improvement';
    return 'Requires Significant Work';
  };
  
  const getScoreGradient = (value) => {
    if (value >= 80) return 'linear-gradient(to right, #10b981, #059669)';
    if (value >= 60) return 'linear-gradient(to right, #f59e0b, #d97706)';
    return 'linear-gradient(to right, #ef4444, #b91c1c)';
  };
  
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-2 mb-4">
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">Overall Performance</h3>
        <motion.div 
          className={`text-6xl font-bold ${getScoreColor(score)}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 15, 
            delay: 0.2 
          }}
        >
          {animatedScore}
          <span className="text-2xl font-normal text-gray-500 dark:text-gray-400">/100</span>
        </motion.div>
        
        <motion.p 
          className={`text-lg font-medium ${getScoreColor(score)}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {getScoreMessage(score)}
        </motion.p>
      </div>
      
      {/* Premium Score Meter */}
      <div className="mt-6 mb-10 relative">
        {/* Score Background Bar */}
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="absolute top-0 left-0 h-full rounded-full shadow-lg"
            style={{ 
              width: `${animatedScore}%`,
              background: getScoreGradient(animatedScore)
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </motion.div>
        </div>
        
        {/* Score Circle Indicator */}
        <motion.div 
          className="absolute top-0 -mt-1.5 h-6 w-6 rounded-full shadow-md flex items-center justify-center"
          style={{ 
            left: `calc(${animatedScore}% - 12px)`, 
            background: getScoreGradient(animatedScore),
            border: '2px solid white',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
          }}
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: `calc(${score}% - 12px)`, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap">
            {animatedScore}%
          </span>
        </motion.div>
        
        {/* Score markers - Positioned BELOW the bar for visibility */}
        <div className="relative flex justify-between w-full mt-4 px-0">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div key={mark} className="flex flex-col items-center">
              <div className="w-0.5 h-2 bg-gray-400 dark:bg-gray-500 mb-1"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{mark}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-6 text-center text-sm">
        <motion.div 
          className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 shadow-sm hover:shadow-md transition-shadow"
          whileHover={{ y: -2 }}
        >
          <div className="font-medium">Needs Work</div>
          <div className="text-xs">0-59</div>
        </motion.div>
        <motion.div 
          className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm hover:shadow-md transition-shadow"
          whileHover={{ y: -2 }}
        >
          <div className="font-medium">Satisfactory</div>
          <div className="text-xs">60-79</div>
        </motion.div>
        <motion.div 
          className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm hover:shadow-md transition-shadow"
          whileHover={{ y: -2 }}
        >
          <div className="font-medium">Excellent</div>
          <div className="text-xs">80-100</div>
        </motion.div>
      </div>
    </div>
  );
}