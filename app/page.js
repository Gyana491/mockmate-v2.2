"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [skill, setSkill] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [customQuestionCount, setCustomQuestionCount] = useState(false);
  
  // Common skills people might want to practice
  const commonSkills = [
    "JavaScript", "React", "Python", "Node.js", "Java", 
    "C#", "SQL", "AWS", "Docker", "TypeScript"
  ];

  // Trending skills - could be fetched from an API in a real app
  const trendingSkills = [
    "React Native", "Next.js", "Machine Learning", "Kubernetes", 
    "GraphQL", "Blockchain", "Flutter", "Rust", "Go"
  ];

  // Handle custom question count input
  const handleQuestionCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 50) {
      setQuestionCount(value);
    }
  };

  // Toggle between dropdown and custom input
  const toggleCustomCount = () => {
    setCustomQuestionCount(!customQuestionCount);
  };

  // Construct the interview URL with all parameters
  const getInterviewUrl = () => {
    if (!skill) return "#";
    let url = `/interview/${encodeURIComponent(skill)}`;
    // Add difficulty and count as URL params
    url += `?difficulty=${difficulty}&count=${questionCount}`;
    return url;
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl min-h-screen flex flex-col">
      <section className="flex-grow flex flex-col items-center justify-center py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 md:p-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Start a Mock Interview</span>
            </h2>
            
            <div className="mb-8 space-y-3">
              <label htmlFor="skill" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                Choose a skill to practice:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="skill"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="Enter a programming language or technology"
                  className="w-full pl-10 pr-10 py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
                  aria-label="Enter a skill to practice"
                />
                {skill && (
                  <button 
                    onClick={() => setSkill("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Clear input"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Common skills section */}
            <div className="mb-7">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Popular skills:
              </h3>
              <div className="flex flex-wrap gap-2">
                {commonSkills.map((commonSkill) => (
                  <motion.button
                    key={commonSkill}
                    className={`px-3.5 py-2 text-sm rounded-full border transition-all duration-200 ${
                      skill === commonSkill 
                        ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700 font-medium shadow-sm" 
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-650"
                    }`}
                    onClick={() => setSkill(commonSkill)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={skill === commonSkill}
                  >
                    {commonSkill}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Trending skills section */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                Trending skills:
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSkills.map((trendingSkill) => (
                  <motion.button
                    key={trendingSkill}
                    className={`px-3.5 py-2 text-sm rounded-full border transition-all duration-200 ${
                      skill === trendingSkill 
                        ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-300 dark:bg-gradient-to-r dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-300 dark:border-indigo-700 font-medium shadow-sm" 
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-650"
                    }`}
                    onClick={() => setSkill(trendingSkill)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={skill === trendingSkill}
                  >
                    {trendingSkill}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Interview settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Difficulty level */}
              <div className="space-y-2">
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Difficulty level:
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  <option value="basic">Basic - For beginners</option>
                  <option value="intermediate">Intermediate - Some experience</option>
                  <option value="advanced">Advanced - Experienced professionals</option>
                  <option value="mixed">Mixed - Variety of questions</option>
                </select>
              </div>
              
              {/* Number of questions */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={customQuestionCount ? "customCount" : "questionCount"} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of questions:
                  </label>
                  <button 
                    onClick={toggleCustomCount}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                    aria-label={customQuestionCount ? "Use preset values" : "Enter custom value"}
                  >
                    {customQuestionCount ? "Use presets" : "Custom value"}
                  </button>
                </div>
                
                {customQuestionCount ? (
                  <div className="relative">
                    <input
                      type="number"
                      id="customCount"
                      min="1"
                      max="50"
                      value={questionCount}
                      onChange={handleQuestionCountChange}
                      className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      aria-label="Enter custom number of questions"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                      questions
                    </div>
                  </div>
                ) : (
                  <select
                    id="questionCount"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="5">5 questions (~10 minutes)</option>
                    <option value="10">10 questions (~20 minutes)</option>
                    <option value="15">15 questions (~30 minutes)</option>
                    <option value="20">20 questions (~40 minutes)</option>
                  </select>
                )}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: skill ? 1.03 : 1 }}
              whileTap={{ scale: skill ? 0.97 : 1 }}
              className="mt-2"
            >
              <Link 
                href={getInterviewUrl()}
                className={`w-full block text-center py-4 px-4 rounded-lg font-medium text-white transition-all duration-300 shadow-lg ${
                  skill 
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 cursor-pointer" 
                    : "bg-gray-400 cursor-not-allowed opacity-70"
                }`}
                onClick={(e) => !skill && e.preventDefault()}
                aria-disabled={!skill}
              >
                {skill ? "Start Your Interview" : "Select a skill to continue"}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
