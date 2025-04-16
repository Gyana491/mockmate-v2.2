"use client";

export default function InterviewHeader({ 
  skillName, 
  currentStage, 
  currentQuestionIndex, 
  totalQuestions, 
  interviewCompleted,
  difficultyLevel = "intermediate" 
}) {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white rounded-xl shadow-md mb-6">
      <div>
        <h1 className="text-xl font-bold flex items-center">
          <span className="mr-2">MockMate:</span> 
          <span className="text-indigo-200">{skillName}</span>
        </h1>
        <div className="flex items-center text-xs text-indigo-200 mt-1">
          <span className="px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-100 mr-2">
            {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
          </span>
          {currentStage === "intro" ? (
            <span>Getting started</span>
          ) : interviewCompleted ? (
            <span>Interview completed</span>
          ) : (
            <span>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!interviewCompleted && currentStage !== "intro" && (
          <div className="flex items-center">
            <div className="w-12 h-2 bg-indigo-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        )}
        <div className="text-sm font-medium">
          {interviewCompleted 
            ? "Evaluation" 
            : currentStage === "intro" 
            ? "Introduction" 
            : `${Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%`}
        </div>
      </div>
    </header>
  );
}