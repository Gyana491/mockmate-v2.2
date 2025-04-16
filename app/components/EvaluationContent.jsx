"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import RobotAvatar from "./RobotAvatar";
import ScoreSection from "./ScoreSection";

export default function EvaluationContent({ 
  evaluation, 
  robotSpeaking, 
  handleStartNewInterview,
  interviewHistory,
  questionFeedback,
  difficultyLevel = "intermediate",
  totalQuestions = 5
}) {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col gap-8 max-w-5xl mx-auto"
      initial="hidden"
      animate={isLoaded ? "show" : "hidden"}
      variants={staggerContainer}
    >
      <motion.div 
        className="flex flex-col items-center gap-4"
        variants={fadeIn}
      >
        <div className="relative">
          <RobotAvatar isSpeaking={robotSpeaking} size={120} />
          <motion.div 
            className="absolute -right-2 -bottom-2 bg-indigo-600 text-white rounded-full p-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 500, damping: 15 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
        </div>
        <motion.h2 
          className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent text-center"
          variants={fadeIn}
        >
          Your Interview Evaluation
        </motion.h2>
        <motion.p 
          className="text-gray-600 dark:text-gray-300 text-center max-w-2xl"
          variants={fadeIn}
        >
          Based on your responses to {totalQuestions} {difficultyLevel}-level questions, 
          we've analyzed your performance and prepared detailed feedback to help you improve.
        </motion.p>
      </motion.div>
      
      <motion.div 
        className="flex justify-center mb-4"
        variants={fadeIn}
      >
        <ScoreSection score={evaluation.score} />
      </motion.div>
      
      {/* Overview Section - Beautiful Card Design */}
      <motion.div
        className="w-full"
        variants={fadeIn}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Overall Assessment</h3>
          </div>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-lg leading-relaxed">
              {evaluation?.review || "Your technical interview skills show promising aspects along with areas that could benefit from targeted improvement."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl shadow-sm">
                <div className="font-medium text-indigo-700 dark:text-indigo-400 mb-1">
                  {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} Level
                </div>
                <div className="text-2xl font-bold">{evaluation?.score || 0}/100</div>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl shadow-sm">
                <div className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">Key Strengths</div>
                <div className="text-sm">{typeof evaluation?.strengths === 'string' ? evaluation.strengths.split('.')[0] : "Technical knowledge"}</div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl shadow-sm">
                <div className="font-medium text-amber-700 dark:text-amber-400 mb-1">Focus Areas</div>
                <div className="text-sm">{typeof evaluation?.weaknesses === 'string' ? evaluation.weaknesses.split('.')[0] : "Communication clarity"}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Strengths Section */}
      <motion.div
        className="w-full"
        variants={fadeIn}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">Your Strengths</h3>
          </div>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-lg leading-relaxed">{evaluation?.strengths || "You demonstrated good technical knowledge and structured thinking in your responses."}</p>
            
            {typeof evaluation?.strengths === 'string' && (
              <div className="mt-6 space-y-3">
                {evaluation.strengths.split('.').filter(s => s.trim()).map((strength, index) => (
                  <div key={index} className="flex items-start bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl shadow-sm">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-1 rounded-full mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p>{strength.trim()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Areas for Improvement Section */}
      <motion.div
        className="w-full"
        variants={fadeIn}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400">Areas for Improvement</h3>
          </div>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-lg leading-relaxed">{evaluation?.weaknesses || "Consider providing more detailed examples and focusing on the clarity of your technical explanations."}</p>
            
            {typeof evaluation?.weaknesses === 'string' && (
              <div className="mt-6 space-y-3">
                {evaluation.weaknesses.split('.').filter(w => w.trim()).map((weakness, index) => (
                  <div key={index} className="flex items-start bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl shadow-sm">
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 p-1 rounded-full mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p>{weakness.trim()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Recommendations Section */}
      <motion.div
        className="w-full"
        variants={fadeIn}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Recommendations for Improvement</h3>
          </div>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-lg leading-relaxed">{evaluation?.suggestions || "To enhance your interview performance, consider practicing with a structured approach to answering technical questions."}</p>
            
            {typeof evaluation?.suggestions === 'string' && (
              <div className="mt-6 space-y-4">
                {evaluation.suggestions.split('.').filter(s => s.trim()).map((suggestion, index) => (
                  <div key={index} className="flex items-start bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl shadow-sm">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <p>{suggestion.trim()}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800/20">
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resources to help you improve:
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Practice with more MockMate interviews focusing on your weak areas
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Review technical concepts where you struggled to articulate your answers
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Consider recording yourself answering interview questions to improve delivery
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Study the STAR method (Situation, Task, Action, Result) for structuring responses
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>

      
      {/* Interview History Section */}
      {interviewHistory.length > 0 && (
        <motion.div
          className="w-full"
          variants={fadeIn}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                {totalQuestions} {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} Questions & Responses
              </h3>
            </div>
            
            <div className="flex flex-col gap-4 mt-4">
              {interviewHistory.map((item, index) => {
                // Group questions with their answers
                if (item.type === 'answer' && index > 0 && interviewHistory[index-1].type === 'question') {
                  return null; // Skip answers as they'll be shown with their questions
                }
                
                if (item.type === 'question') {
                  const questionIndex = item.index;
                  const answerIndex = index + 1;
                  const hasAnswer = answerIndex < interviewHistory.length && interviewHistory[answerIndex].type === 'answer';
                  const answer = hasAnswer ? interviewHistory[answerIndex].content : "No answer provided";
                  
                  // Find relevant feedback for this question
                  const feedback = questionFeedback && questionFeedback.questionNumber === questionIndex ? questionFeedback : null;
                  
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-5 rounded-xl shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    >
                      <div className="font-semibold mb-3 text-gray-700 dark:text-gray-300 flex justify-between items-center">
                        <span className="flex items-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs mr-2">
                            {questionIndex}
                          </span>
                          <span>Question {questionIndex}</span>
                        </span>
                        <button 
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => toggleExpand(index)}
                          aria-expanded={expandedItems[index] ? 'true' : 'false'}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 transition-transform ${expandedItems[index] ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${expandedItems[index] ? 'max-h-[1000px]' : 'max-h-32'}`}>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-4">
                          <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                            {item.content}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs mr-2">
                              A
                            </span>
                            Your Response:
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                            <p className="text-gray-800 dark:text-gray-200">
                              {answer}
                            </p>
                          </div>
                        </div>
                        
                        {feedback && (
                          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mr-2 shadow-md">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 text-lg">Feedback Analysis</span>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                  {feedback.feedback}
                                </p>
                              </div>
                              
                              {feedback.score !== undefined && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/70 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 backdrop-blur-sm transition-transform hover:scale-[1.02] duration-300">
                                    <div className="flex items-center mb-2">
                                      <div className="h-3 w-3 rounded-full bg-indigo-500 mr-2"></div>
                                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Question Score</h4>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mr-2">{feedback.score}%</div>
                                      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            feedback.score >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                            feedback.score >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                                            'bg-gradient-to-r from-rose-400 to-rose-500'
                                          }`}
                                          style={{ width: `${feedback.score}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                
                                  {feedback.strength && (
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-4 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800/30 backdrop-blur-sm transition-transform hover:scale-[1.02] duration-300">
                                      <div className="flex items-center mb-2">
                                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 mr-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        </span>
                                        <h4 className="font-medium text-emerald-700 dark:text-emerald-400">Strength</h4>
                                      </div>
                                      <p className="text-emerald-800 dark:text-emerald-300 text-sm">{feedback.strength}</p>
                                    </div>
                                  )}
                                
                                  {feedback.improvement && (
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-900/20 dark:to-amber-900/10 p-4 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800/30 backdrop-blur-sm transition-transform hover:scale-[1.02] duration-300">
                                      <div className="flex items-center mb-2">
                                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400 mr-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                          </svg>
                                        </span>
                                        <h4 className="font-medium text-amber-700 dark:text-amber-400">Improvement</h4>
                                      </div>
                                      <p className="text-amber-800 dark:text-amber-300 text-sm">{feedback.improvement}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="mt-2 flex justify-end">
                                <div className="text-xs text-gray-500 dark:text-gray-400 italic flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  AI-powered analysis
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                }
                return null;
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      
      <motion.div 
        className="flex flex-col md:flex-row justify-center gap-4 mt-8 mb-4"
        variants={fadeIn}
      >
        <motion.button 
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          onClick={handleStartNewInterview}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start New Interview
        </motion.button>
        
        <motion.button 
          className="px-6 py-3 rounded-xl font-semibold text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300 flex items-center justify-center gap-2"
          onClick={() => router.push('/')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Return to Home
        </motion.button>
      </motion.div>
      
      <motion.div
        className="flex justify-center mt-4 mb-8"
        variants={fadeIn}
      >
        <button 
          className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm flex items-center gap-1 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow"
          onClick={() => window.print()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print or Save as PDF
        </button>
      </motion.div>
    </motion.div>
  );
}