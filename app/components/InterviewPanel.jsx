"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RobotAvatar from "./RobotAvatar";
import UserAvatar from "./UserAvatar";
import InterviewHeader from "./InterviewHeader";
import ParticipantSpeechBubble from "./ParticipantSpeechBubble";
import InteractionSection from "./InteractionSection";
import EvaluationContent from "./EvaluationContent";
import VoiceRecorder from "./VoiceRecorder";
import { speakText } from "../lib/speechSynthesis"; // Import speakText

export default function InterviewPanel({ skillParam, difficultyParam = "intermediate", questionCountParam = 5 }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [robotSpeaking, setRobotSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [userProcessingAudio, setUserProcessingAudio] = useState(false);
  const [waitingForUserAction, setWaitingForUserAction] = useState(false);
  const [currentStage, setCurrentStage] = useState("intro"); // intro, question, answer, feedback, evaluation
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false); // Track if user submitted the answer
  const [isAnswerProcessing, setIsAnswerProcessing] = useState(false); // Track if answer is being processed
  const [totalQuestions, setTotalQuestions] = useState(questionCountParam); // Now set from props
  const [answers, setAnswers] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(difficultyParam);
  const [questionFeedback, setQuestionFeedback] = useState(null);
  const [continueButtonVisible, setContinueButtonVisible] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isRobotSpeaking, setIsRobotSpeaking] = useState(false); // Use a dedicated state for actual speech synthesis

  // Initialize skill name and other params from URL parameters
  useEffect(() => {
    if (skillParam) {
      try {
        // Decode the skill parameter (it might be URL encoded)
        const decodedSkill = decodeURIComponent(skillParam);
        setSkillName(decodedSkill);
      } catch (error) {
        console.error("Error decoding skill parameter:", error);
        // Fallback to the raw parameter if decoding fails
        setSkillName(skillParam);
      }
    } else {
      // Fallback to a default if no skill was provided
      setSkillName("JavaScript");
    }
    
    // Set difficulty and question count from props
    setDifficultyLevel(difficultyParam);
    setTotalQuestions(parseInt(questionCountParam));
  }, [skillParam, difficultyParam, questionCountParam]);

  // Fetch all questions at once - updated to include difficulty and count
  const fetchAllQuestions = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const encodedSkill = encodeURIComponent(skillName);
      const url = `/api/question?skill=${encodedSkill}&difficulty=${difficultyLevel}&count=${totalQuestions}&all=true`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        setAllQuestions(data.questions);
        return data.questions; // Return the questions directly
      } else {
        console.error("Error fetching questions:", res.status);
        setApiError("Failed to fetch questions. Please try again.");
        return []; // Return empty array on error
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setApiError("Failed to fetch questions. Please check your connection.");
      return []; // Return empty array on exception
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the current robot speech bubble content - updated for difficulty
  const getRobotSpeechContent = () => {
    if (apiError) {
      return `Sorry, there was an error: ${apiError}. Please try again.`;
    }

    // Ensure currentQuestion is defined before accessing it
    const currentQuestion = allQuestions[currentQuestionIndex]?.question || "";

    switch (currentStage) {
      case "intro":
        return `Welcome to your ${skillName} Mock Interview! I'll be asking you ${totalQuestions} ${difficultyLevel} level technical questions. Take your time to think about each answer before responding. Ready to begin?`;
      case "question":
        // Ensure data is fetched before starting the robot's speech
        if (!currentQuestion) {
          console.warn("No question available. Waiting for data to be fetched.");
          return;
        }
        return isLoading ? "Loading question..." : question;
      case "answer":
        return "Processing your answer...";
      case "feedback":
        if (questionFeedback) {
          return `${questionFeedback.feedback || "Thanks for your answer."} ${
            currentQuestionIndex + 1 < totalQuestions
              ? "Let's continue to the next question when you're ready."
              : "We've completed all the questions. Let's review your overall performance."
          }`;
        }
        return isLoading ? "Processing your answer..." : "Thanks for your answer.";
      case "evaluation":
        return isLoading
          ? "I'm evaluating your overall interview performance..."
          : "Evaluation complete. Here's your feedback.";
      default:
        return "";
    }
  };

  // Effect to handle Robot's Speech Synthesis (TTS)
  useEffect(() => {
    const robotContent = getRobotSpeechContent();

    // Only speak if robotSpeaking state is true, content is available, and not already speaking
    if (robotSpeaking && robotContent && !isRobotSpeaking) {
      setIsRobotSpeaking(true); // Mark that synthesis has started

      speakText(robotContent, {
        onEnd: () => {
          console.log("TTS ended for:", robotContent);
          setIsRobotSpeaking(false); // Mark that synthesis has finished
          setRobotSpeaking(false); // Update the main state if needed

          // Transition to waiting for user only after speaking finishes
          if (currentStage === "question") {
            setWaitingForUserAction(true);
          }
          // If feedback was just given, make continue button visible
          if (currentStage === "feedback" || currentStage === "intro") {
            setContinueButtonVisible(true);
          }
          // If evaluation was just read
          if (currentStage === "evaluation") {
            // Potentially enable buttons or next actions here
          }
        },
        onError: (error) => {
          // Improved error logging with more details
          console.error("TTS Error:", error?.type || "unknown error", error?.message || "");

          // Always ensure UI state is properly reset
          setIsRobotSpeaking(false); // Mark that synthesis finished (due to error)
          setRobotSpeaking(false); // Update the main state

          // Don't set apiError for common speech synthesis errors
          // This prevents cascading errors and error message loops
          if (error?.type === "not-allowed") {
            console.warn("Speech synthesis permission denied - please interact with the page first");
            // Just show continue button without error message
            setContinueButtonVisible(true);
          } else if (error?.type === "interrupted" || error?.type === "canceled") {
            console.warn("Speech synthesis was interrupted or canceled");
            // Just continue flow without error message
            if (currentStage === "question") {
              setWaitingForUserAction(true);
            } else if (currentStage === "feedback" || currentStage === "intro") {
              setContinueButtonVisible(true);
            }
          } else {
            // For other errors, show error message
            setApiError("Sorry, I encountered an issue speaking. Please click to continue.");
            // Make continue button visible even on error to allow user to proceed
            setContinueButtonVisible(true);
          }
        },
      });
    } else if (!robotSpeaking && isRobotSpeaking) {
      // If the main state `robotSpeaking` becomes false while synthesis is active, cancel it
      window.speechSynthesis.cancel();
      setIsRobotSpeaking(false);
    }
  }, [
    robotSpeaking,
    currentStage,
    question,
    questionFeedback,
    evaluation,
    apiError,
    isRobotSpeaking,
    getRobotSpeechContent, // Added missing dependency
  ]);

  // Display the current question
  const displayCurrentQuestion = () => {
    if (allQuestions.length === 0 || currentQuestionIndex >= allQuestions.length) {
      return;
    }

    setRobotSpeaking(true);
    setCurrentStage("question");
    setWaitingForUserAction(false);
    setQuestionFeedback(null);
    setContinueButtonVisible(false);
    setLiveTranscription("");
    setIsAnswerSubmitted(false); // Reset answer submitted state for new question

    // Get the current question
    const currentQuestionText = allQuestions[currentQuestionIndex].question;
    setQuestion(currentQuestionText);

    // Add this question to the interview history
    setInterviewHistory((prev) => [
      ...prev,
      { type: "question", content: currentQuestionText, index: currentQuestionIndex + 1 },
    ]);

    // Calculate speaking duration based on question length for natural feel
    const speakingDuration = Math.max(4000, currentQuestionText.length * 50);

    // Set robotSpeaking to true to trigger the useEffect hook for TTS
    setRobotSpeaking(true);
  };

  // When current question index changes, display the new question
  useEffect(() => {
    if (
      currentStage === "question" &&
      allQuestions.length > 0 &&
      currentQuestionIndex < allQuestions.length
    ) {
      displayCurrentQuestion();
    }
  }, [currentQuestionIndex, currentStage, allQuestions, displayCurrentQuestion]); // Now correctly includes displayCurrentQuestion

  const handleAnswer = async (transcribedText) => {
    setLiveTranscription(transcribedText);
  };

  const handleSubmitAnswer = async () => {
    // Check for empty input and set a default message if necessary
    if (!liveTranscription || liveTranscription.trim() === '') {
      setLiveTranscription("I don't have an answer for this question.");
    }
    
    // Set the answer submitted state to true
    setIsAnswerSubmitted(true);
    
    // Set processing state
    setIsAnswerProcessing(true);

    // Cancel any ongoing speech synthesis before processing answer
    window.speechSynthesis.cancel();
    setIsRobotSpeaking(false);
    setRobotSpeaking(false);

    setCurrentStage("answer");
    setContinueButtonVisible(false);
    setIsLoading(true);
    setApiError(null);
    
    // Add a message to show processing state
    setInterviewHistory((prev) => [...prev, { 
      type: "system", 
      content: "Processing your answer...",
      temporary: true
    }]);

    // Add this answer to the interview history
    // Use the normalized/default answer if input was empty
    const finalAnswer = liveTranscription.trim() === '' 
      ? "I don't have an answer for this question." 
      : liveTranscription;
      
    setInterviewHistory((prev) => {
      // Filter out any temporary messages
      const filteredHistory = prev.filter(item => !item.temporary);
      return [...filteredHistory, { type: "answer", content: finalAnswer }];
    });

    setAnswers((prev) => [...prev, finalAnswer]);

    // Generate feedback for this specific question/answer
    try {
      // Get individual question feedback
      const feedbackRes = await fetch("/api/question-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer: finalAnswer,
          skill: skillName,
          difficulty: difficultyLevel
        }),
      });

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json();
        setQuestionFeedback(feedbackData);
        setCurrentStage("feedback");
        setRobotSpeaking(true); // Trigger TTS for feedback *after* getting it
      } else {
        console.error("Feedback error:", feedbackRes.status);
        setApiError("Failed to generate feedback. Please try again.");
        setRobotSpeaking(false); // Ensure robot isn't stuck speaking on error
        setContinueButtonVisible(true); // Allow user to proceed
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      setApiError("Failed to generate feedback. Please check your connection.");
      setRobotSpeaking(false); // Ensure robot isn't stuck speaking on error
      setContinueButtonVisible(true); // Allow user to proceed
    } finally {
      setIsLoading(false);
      setIsAnswerProcessing(false);
    }
  };

  const handleContinue = async () => {
    window.speechSynthesis.cancel();
    setIsRobotSpeaking(false);
    setRobotSpeaking(false);
    setContinueButtonVisible(false);
    if (currentStage === "intro") {
      // Fetch questions when the user clicks "Start Interview"
      setContinueButtonVisible(false);
      setIsLoading(true);
      try {
        const questions = await fetchAllQuestions();

        // Check if we have questions and no errors before proceeding
        if (questions.length > 0 && !apiError) {
          // Update the question state but don't add to history yet (displayCurrentQuestion will do that)
          const currentQuestionText = questions[currentQuestionIndex]?.question;
          if (currentQuestionText) {
            setQuestion(currentQuestionText);
            setCurrentStage("question");
            setWaitingForUserAction(false);
            setQuestionFeedback(null);
            setLiveTranscription("");
            
            // Don't add to interview history here - will be handled by displayCurrentQuestion
            
            setTimeout(() => {
              setRobotSpeaking(true); // Trigger TTS only after question is set
            }, 100); // Small delay to ensure state is updated
          }
        } else {
          // If no questions were fetched or there was an error, show error and continue button
          if (!apiError) {
            setApiError("Failed to fetch questions. Please try again.");
          }
          setContinueButtonVisible(true);
        }
      } catch (error) {
        console.error("Error in handleContinue:", error);
        setApiError("Failed to start interview. Please try again.");
        setContinueButtonVisible(true);
      } finally {
        setIsLoading(false);
      }

      return;
    } else if (currentStage === "feedback") {
      // Check if this was the last question
      if (currentQuestionIndex + 1 >= totalQuestions) {
        // Proceed to final evaluation
        setCurrentStage("evaluation");
        setIsLoading(true);
        setApiError(null);

        try {
          const res = await fetch("/api/evaluation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers: answers,
              skill: skillName,
              difficulty: difficultyLevel
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setEvaluation(data);
            setInterviewCompleted(true);
            setRobotSpeaking(true); // Trigger TTS for evaluation *after* getting it
          } else {
            console.error("Evaluation error:", res.status);
            setApiError("Failed to generate evaluation. Please try again.");
            setRobotSpeaking(false); // Ensure robot isn't stuck speaking on error
          }
        } catch (error) {
          console.error("Error generating evaluation:", error);
          setApiError("Failed to generate evaluation. Please check your connection.");
          setRobotSpeaking(false); // Ensure robot isn't stuck speaking on error
        } finally {
          setIsLoading(false);
        }
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentStage("question");
      }
    }
  };

  const handleSkipQuestion = () => {
    // Cancel any ongoing speech synthesis before skipping
    window.speechSynthesis.cancel();
    setIsRobotSpeaking(false);
    setRobotSpeaking(false);

    // Set the answer submitted state for skipping
    setIsAnswerSubmitted(true);

    // Add a placeholder answer to the interview history and answers array
    const skippedAnswer = "Question skipped by user.";

    setInterviewHistory((prev) => [...prev, { type: "answer", content: skippedAnswer }]);

    setAnswers((prev) => [...prev, skippedAnswer]);

    // Add basic feedback for skipped question
    setQuestionFeedback({
      questionNumber: currentQuestionIndex + 1,
      feedback:
        "You chose to skip this question. It's okay to skip questions you're unsure about, but try to attempt as many as you can in a real interview.",
    });

    setCurrentStage("feedback");
    setRobotSpeaking(true); // Trigger TTS for skip feedback
  };

  const handleRecordingStatus = (isRecording, isProcessing) => {
    setUserSpeaking(isRecording);
    setUserProcessingAudio(isProcessing);
  };

  const handleLiveTranscription = (text) => {
    setLiveTranscription(text);
  };

  const handleStartNewInterview = () => {
    // Cancel any ongoing speech synthesis
    window.speechSynthesis.cancel();
    setIsRobotSpeaking(false);

    setInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setInterviewHistory([]);
    setEvaluation(null);
    setQuestionFeedback(null);
    setCurrentStage("intro");
    setLiveTranscription("");
    setApiError(null);
    setIsAnswerSubmitted(false); // Reset answer submitted state

    // Don't trigger TTS automatically, just make continue button visible
    setContinueButtonVisible(true);
    // Remove: setRobotSpeaking(true);
  };

  // Initialize the interview when component mounts
  useEffect(() => {
    // Don't auto-trigger speech on mount, just set the state and show continue button
    if (currentStage === "intro") {
      // Do NOT set robotSpeaking true here - wait for user interaction
      setContinueButtonVisible(true); // Make the start button visible immediately
    }
  }, [currentStage]); // Now correctly includes currentStage

  return (
    <div className="max-w-5xl mx-auto p-4">
      <InterviewHeader
        skillName={skillName}
        currentStage={currentStage}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        interviewCompleted={interviewCompleted}
        difficultyLevel={difficultyLevel}
      />
      
      {!interviewCompleted ? (
        <div className="flex flex-col gap-4">
          {/* Main interview panel with compact layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Small screen layout - Avatars side by side */}
            <div className="lg:hidden grid grid-cols-2 gap-4 w-full">
              {/* Left side - Robot */}
              <div className="bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 p-4 flex flex-col items-center justify-center rounded-lg">
                <RobotAvatar isSpeaking={robotSpeaking} size={80} />
                <div className="mt-3 text-center">
                  <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">MockMate</div>
                  <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70 flex items-center justify-center gap-1">
                    {isRobotSpeaking ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Speaking
                      </>
                    ) : (
                      isLoading ? "Processing..." : "Listening"
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right side - User */}
              <div className="bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 p-4 flex flex-col items-center rounded-lg">
                <UserAvatar isSpeaking={userSpeaking || userProcessingAudio} size={80} />
                <div className="mt-3 text-center">
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">You</div>
                  <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 flex items-center justify-center gap-1">
                    {userSpeaking ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Recording
                      </>
                    ) : userProcessingAudio ? "Processing..." : isAnswerProcessing ? "Analyzing response..." : "Ready"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop layout - Left side Robot (hidden on small screens) */}
            <div className="hidden lg:flex lg:col-span-3 bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 p-4 flex-col items-center justify-center">
              <RobotAvatar isSpeaking={robotSpeaking} size={120} />
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">MockMate</div>
                <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70 flex items-center justify-center gap-1">
                  {isRobotSpeaking ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                      Speaking
                    </>
                  ) : (
                    isLoading ? "Processing..." : "Listening"
                  )}
                </div>
              </div>
            </div>
            
            {/* Middle section - Chat/Content */}
            <div className="lg:col-span-6 p-4 flex flex-col">
              <div className="flex-1 min-h-[200px] max-h-[300px] overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <ParticipantSpeechBubble
                  type="robot"
                  isSpeaking={isRobotSpeaking}
                  isProcessing={isLoading && currentStage !== "answer"}
                  labelText="MockMate:"
                  content={getRobotSpeechContent()}
                  isActive
                />
                
                {waitingForUserAction && currentStage !== "feedback" && (
                  <div className="mt-4">
                    <ParticipantSpeechBubble
                      type="user"
                      isSpeaking={userSpeaking}
                      isProcessing={userProcessingAudio}
                      labelText="You:"
                      content={liveTranscription}
                      isActive={true}
                      liveTranscription={liveTranscription}
                      isEditable={true}
                      onContentChange={(text) => setLiveTranscription(text)}
                    />
                  </div>
                )}
              </div>
              
              {/* Continue button for intro/feedback stages */}
              {continueButtonVisible && (
                <div className="flex justify-center">
                  <button 
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={handleContinue}
                  >
                    {currentStage === "intro" ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>Start Interview</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {currentStage === "feedback" && currentQuestionIndex + 1 < totalQuestions
                            ? "Next Question"
                            : "Complete Interview"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Voice action buttons */}
              {currentStage === "question" && waitingForUserAction && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <button
                    className="flex-1 px-3 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSkipQuestion}
                    disabled={!waitingForUserAction || userSpeaking || isAnswerProcessing}
                  >
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h4.59l-2.1 1.95a.75.75 0 001.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 10-1.02 1.1l2.1 1.95H6.75z" />
                      </svg>
                      Skip
                    </span>
                  </button>
                  <button
                    className="flex-1 px-3 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmitAnswer}
                    disabled={!waitingForUserAction || userSpeaking || isAnswerProcessing}
                  >
                    {isAnswerProcessing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Submit
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              {/* Voice recorder for mobile */}
              {currentStage === "question" && waitingForUserAction && (
                <div className="lg:hidden w-full mt-4">
                  <VoiceRecorder
                    onStop={handleAnswer}
                    onRecordingStatusChange={handleRecordingStatus}
                    onLiveTranscription={handleLiveTranscription}
                    disabled={!waitingForUserAction || isAnswerProcessing}
                  />
                </div>
              )}
              
              {/* Progress indicator */}
              <div className="mt-3 flex flex-col xs:flex-row justify-between items-start xs:items-center text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center mb-2 xs:mb-0">
                  <div className="relative w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.max(((currentQuestionIndex) / totalQuestions) * 100, 5)}%` }}
                    />
                  </div>
                  <span>Question {currentQuestionIndex + 1}/{totalQuestions}</span>
                </div>
                  
                {currentStage === "question" && (
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{waitingForUserAction ? "Your turn" : "Waiting..."}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Desktop layout - Right side User (hidden on small screens) */}
            <div className="hidden lg:flex lg:col-span-3 bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 p-4 flex-col items-center">
              <UserAvatar isSpeaking={userSpeaking || userProcessingAudio} size={120} />
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">You</div>
                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 flex items-center justify-center gap-1">
                  {userSpeaking ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Recording
                    </>
                  ) : userProcessingAudio ? "Processing..." : isAnswerProcessing ? "Analyzing response..." : "Ready"}
                </div>
                
                {/* Voice recorder - Only visible on desktop */}
                {currentStage === "question" && waitingForUserAction && (
                  <div className="w-full mt-4">
                    <VoiceRecorder
                      onStop={handleAnswer}
                      onRecordingStatusChange={handleRecordingStatus}
                      onLiveTranscription={handleLiveTranscription}
                      disabled={!waitingForUserAction || isAnswerProcessing}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EvaluationContent
          evaluation={evaluation}
          robotSpeaking={isRobotSpeaking}
          handleStartNewInterview={handleStartNewInterview}
          interviewHistory={interviewHistory}
          questionFeedback={questionFeedback}
          difficultyLevel={difficultyLevel}
          totalQuestions={totalQuestions}
        />
      )}
    </div>
  );
}
