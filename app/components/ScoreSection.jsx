"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ScoreSection({ score = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Animate the score value
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const interval = 20; // update every 20ms
    const steps = duration / interval;
    const increment = score / steps;
    let currentScore = 0;
    
    const timer = setInterval(() => {
      currentScore += increment;
      if (currentScore >= score) {
        clearInterval(timer);
        setAnimatedScore(score);
      } else {
        setAnimatedScore(Math.floor(currentScore));
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [score]);

  // Determine score color and text based on score value
  const getScoreColor = () => {
    if (score >= 90) return "text-emerald-500 dark:text-emerald-400";
    if (score >= 75) return "text-green-500 dark:text-green-400";
    if (score >= 60) return "text-amber-500 dark:text-amber-400";
    if (score >= 40) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
  };
  
  const getScoreText = () => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  };
  
  const getScoreGradient = () => {
    if (score >= 90) return "from-emerald-500 to-emerald-600";
    if (score >= 75) return "from-green-500 to-green-600";
    if (score >= 60) return "from-amber-500 to-amber-600";
    if (score >= 40) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 max-w-xs w-full hover:shadow-2xl transition-shadow duration-300 text-center">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Overall Score</h3>
      
      <div className="flex justify-center mb-4">
        <div className="relative">
          <svg className="w-40 h-40">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
              className="dark:stroke-gray-700"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              className={`stroke-current ${getScoreColor()}`}
              strokeDasharray="440"
              strokeDashoffset="440"
              initial={{ strokeDashoffset: 440 }}
              animate={{
                strokeDashoffset: 440 - (440 * score) / 100,
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              transform="rotate(-90 80 80)"
            />
            
            {/* Score text */}
            <text
              x="80"
              y="80"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-4xl font-bold ${getScoreColor()}`}
              fill="currentColor"
            >
              {animatedScore}
            </text>
            
            <text
              x="80"
              y="100"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm text-gray-500 dark:text-gray-400"
              fill="currentColor"
            >
              out of 100
            </text>
          </svg>
          
          {/* Add animated dots around the circle to highlight score */}
          {score > 50 && Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${getScoreGradient()}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
              }}
              style={{
                top: 80 + 75 * Math.sin((i * 2 * Math.PI) / 3),
                left: 80 + 75 * Math.cos((i * 2 * Math.PI) / 3),
              }}
            />
          ))}
        </div>
      </div>
      
      <div className={`font-medium text-lg ${getScoreColor()}`}>{getScoreText()}</div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {score >= 60
          ? "You've demonstrated professional interview skills"
          : "Focus on improving your interview techniques"}
      </p>
      
      <div className="mt-4 grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const threshold = index * 20 + 20;
          return (
            <div
              key={index}
              className={`h-1.5 rounded-full ${
                score >= threshold
                  ? `bg-gradient-to-r ${getScoreGradient()}`
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            ></div>
          );
        })}
      </div>
    </div>
  );
}