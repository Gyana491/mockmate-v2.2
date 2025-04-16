"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function InterviewHistory({ interviewHistory, questionFeedback, currentQuestionIndex, isAnswerSubmitted }) {
  const [expandedItems, setExpandedItems] = useState({});
  
  if (interviewHistory.length === 0) return null;
  
  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Check if we're currently in feedback mode for the most recent answer
  const isInFeedbackMode = questionFeedback && 
    questionFeedback.questionNumber === currentQuestionIndex + 1 && 
    interviewHistory.length > 0 && 
    interviewHistory[interviewHistory.length - 1].type === 'answer' &&
    isAnswerSubmitted; // Only consider feedback mode if answer was submitted
  
  return (
    <section className="mt-8 pt-8 border-t border-gray-200" aria-labelledby="interview-progress-heading">
      <h2 
        id="interview-progress-heading" 
        className="text-2xl font-semibold mb-4 text-gray-700 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Interview Progress
      </h2>
      
      <div className="flex flex-col gap-4 mt-6" role="log" aria-live="polite">
        {interviewHistory.map((item, index) => {
          // Skip displaying the most recent answer if we're in feedback mode
          if (isInFeedbackMode && index === interviewHistory.length - 1 && item.type === 'answer') {
            return null;
          }
          
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-5 rounded-xl shadow-md backdrop-blur-sm border ${
                item.type === 'question' 
                  ? 'border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800' 
                  : 'border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800'
              } transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-offset-2 ${
                item.type === 'question' ? 'focus-within:ring-indigo-500' : 'focus-within:ring-emerald-500'
              }`}
              tabIndex={0}
              role={item.type === 'question' ? 'heading' : 'region'}
              aria-label={item.type === 'question' ? `Question ${item.index}` : 'Your Answer'}
              onClick={() => toggleExpand(index)}
            >
              <div className="font-semibold mb-2 text-gray-600 dark:text-gray-300 flex justify-between items-center">
                {item.type === 'question' ? (
                  <span className="flex items-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs mr-2" aria-hidden="true">
                      {item.index}
                    </span>
                    <span>Question {item.index}</span>
                    {currentQuestionIndex === item.index && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
                        Current
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs mr-2" aria-hidden="true">
                      A
                    </span>
                    <span>Your Answer</span>
                  </span>
                )}
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-expanded={expandedItems[index] ? 'true' : 'false'}
                  aria-label={expandedItems[index] ? 'Collapse' : 'Expand'}
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
              
              <div className={`overflow-hidden transition-all ${expandedItems[index] ? 'max-h-[500px]' : 'max-h-20'}`}>
                <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200 mb-2">
                  {item.content}
                </div>
                
                {item.type === 'answer' && index > 0 && interviewHistory[index-1].type === 'question' && (
                  <div className={`mt-3 pt-3 border-t border-dotted border-gray-200 dark:border-gray-700 ${expandedItems[index] ? 'opacity-100' : 'opacity-60'}`}>
                    {index / 2 < questionFeedback?.questionNumber ? (
                      <div className="italic">
                        {index / 2 === currentQuestionIndex - 1 && questionFeedback ? (
                          <div className="space-y-2">
                            <p className="text-indigo-700 dark:text-indigo-400 font-medium">
                              <span className="inline-block mr-2">💬</span>
                              Feedback:
                            </p>
                            <p className="pl-6">{questionFeedback.feedback}</p>
                            
                            {questionFeedback.strength && (
                              <div className="flex items-start mt-2 text-emerald-600 dark:text-emerald-400">
                                <span className="inline-block mr-2">✅</span>
                                <div>
                                  <p className="font-medium">Strength:</p>
                                  <p className="pl-2">{questionFeedback.strength}</p>
                                </div>
                              </div>
                            )}
                            
                            {questionFeedback.improvement && (
                              <div className="flex items-start mt-2 text-amber-600 dark:text-amber-400">
                                <span className="inline-block mr-2">💡</span>
                                <div>
                                  <p className="font-medium">Improvement:</p>
                                  <p className="pl-2">{questionFeedback.improvement}</p>
                                </div>
                              </div>
                            )}
                            
                            {questionFeedback.score !== undefined && (
                              <div className="mt-3 flex items-center">
                                <span className="font-medium mr-2">Score:</span>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      questionFeedback.score >= 80 ? 'bg-emerald-500' :
                                      questionFeedback.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${questionFeedback.score}%` }}
                                    role="progressbar"
                                    aria-valuenow={questionFeedback.score}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                                <span className="ml-2 font-medium">{questionFeedback.score}%</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-emerald-600 dark:text-emerald-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <strong>Question completed</strong>
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}