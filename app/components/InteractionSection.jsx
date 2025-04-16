"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "./VoiceRecorder";

export default function InteractionSection({
  waitingForUserAction,
  currentStage,
  continueButtonVisible,
  currentQuestionIndex,
  totalQuestions,
  handleAnswer,
  handleRecordingStatus,
  handleContinue,
  handleLiveTranscription,
  handleSkipQuestion,
  handleSubmitAnswer,
  userSpeaking,
  userProcessingAudio,
  liveTranscription,
  interviewHistory,
  difficultyLevel = "intermediate"
}) {
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock timer for demonstration purposes
  useEffect(() => {
    if (currentStage === "question" && waitingForUserAction) {
      const mockTime = 120; // 2 minutes
      setTimeLeft(mockTime);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setTimeLeft(null);
    }
  }, [currentStage, waitingForUserAction]);

  // Handle recording status changes from VoiceRecorder
  const handleRecordingStatusUpdates = (isRec, isProc) => {
    setIsRecording(isRec);
    setIsProcessing(isProc);
    
    if (handleRecordingStatus) {
      handleRecordingStatus(isRec, isProc);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine time color based on remaining time
  const getTimeColor = () => {
    if (timeLeft === null) return "text-gray-500 dark:text-gray-400";
    if (timeLeft <= 30) return "text-red-600 dark:text-red-400";
    if (timeLeft <= 60) return "text-amber-600 dark:text-amber-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  return (
    <motion.div 
      className="flex justify-center items-center w-full mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
    >
      <AnimatePresence mode="wait">
        {currentStage === "question" ? (
          <motion.div 
            key="question"
            className="flex flex-col w-full gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Show difficulty badge for the current question */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : waitingForUserAction ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : waitingForUserAction ? 'Ready for your answer' : 'Please wait...'}
                </span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                difficultyLevel === 'basic' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                difficultyLevel === 'advanced' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' :
                difficultyLevel === 'mixed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
              </span>
            </div>
            
            {/* Voice recorder */}
            <div className="w-full">
              <VoiceRecorder
                onStop={handleAnswer}
                onRecordingStatusChange={handleRecordingStatusUpdates}
                onLiveTranscription={handleLiveTranscription}
                disabled={!waitingForUserAction}
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-2 flex-wrap sm:flex-row flex-col">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.1), 0 4px 6px -2px rgba(99, 102, 241, 0.05)" }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                onClick={handleSubmitAnswer}
                disabled={!waitingForUserAction || isRecording}
                aria-label="Submit your answer"
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Submit Answer
              </motion.button>
              
              <div className="relative inline-block">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600"
                  onClick={handleSkipQuestion}
                  disabled={!waitingForUserAction || isRecording}
                  aria-label="Skip this question"
                  onMouseEnter={() => setShowHint(true)}
                  onMouseLeave={() => setShowHint(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                  </svg>
                  Skip Question
                </motion.button>
                
                <AnimatePresence>
                  {showHint && (
                    <motion.div 
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg z-20 whitespace-nowrap"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      You can skip this question, but it may affect your score
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4 px-2 text-sm mt-2">
              <div className="flex items-center">
                <div className="relative w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-gray-600 dark:text-gray-300">
                  Question <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentQuestionIndex + 1}</span> of {totalQuestions}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {timeLeft !== null && (
                  <div className={`flex items-center gap-1.5 ${getTimeColor()}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                  </div>
                )}
                
                <div 
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  aria-live="polite"
                >
                  {waitingForUserAction ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                      <motion.div 
                        className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      Ready
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                      <svg className="animate-spin h-2 w-2 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="continue"
            className="w-full mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {continueButtonVisible && (
              <motion.div 
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.2), 0 4px 6px -2px rgba(99, 102, 241, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={handleContinue}
                  aria-label={
                    currentStage === "intro" ? "Start the interview" : 
                    currentStage === "feedback" && currentQuestionIndex + 1 < totalQuestions ? "Continue to next question" :
                    "Complete interview and see evaluation"
                  }
                >
                  {currentStage === "intro" ? (
                    <>
                      <motion.svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                        initial={{ x: 0 }}
                        animate={isButtonHovered ? { x: [0, 3, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </motion.svg>
                      <span className="text-base">Start Interview</span>
                    </>
                  ) : (
                    <>
                      <motion.svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                        initial={{ x: 0 }}
                        animate={isButtonHovered ? { x: [0, 3, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </motion.svg>
                      <span className="text-base">
                        {currentStage === "feedback" && currentQuestionIndex + 1 < totalQuestions
                          ? "Continue to Next Question"
                          : "Complete Interview"}
                      </span>
                    </>
                  )}
                </motion.button>
                
                {currentStage === "feedback" && (
                  <motion.div 
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-28 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full"
                          initial={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
                          animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{currentQuestionIndex + 1}</span>/{totalQuestions}
                      </span>
                    </div>
                    
                    {currentQuestionIndex + 1 < totalQuestions && (
                      <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs font-medium">
                        {totalQuestions - currentQuestionIndex - 1} questions remaining
                      </span>
                    )}
                  </motion.div>
                )}
                
                {currentStage === "intro" && (
                  <motion.div 
                    className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-md mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p>You'll be asked {totalQuestions} {difficultyLevel}-level technical interview questions. Answer verbally or type your responses.</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}