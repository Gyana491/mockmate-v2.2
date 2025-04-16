"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InterviewPanel from "../../components/InterviewPanel";

export default function InterviewPage({ params }) {
  const searchParams = useSearchParams();
  const [interviewSettings, setInterviewSettings] = useState({
    skill: params.skill,
    difficulty: "intermediate",
    count: 5
  });

  useEffect(() => {
    // Get difficulty and count from URL params
    const difficulty = searchParams.get("difficulty") || "intermediate";
    const count = parseInt(searchParams.get("count") || "5");
    
    setInterviewSettings({
      skill: params.skill,
      difficulty,
      count
    });
  }, [params.skill, searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <InterviewPanel 
        skillParam={interviewSettings.skill} 
        difficultyParam={interviewSettings.difficulty}
        questionCountParam={interviewSettings.count}
      />
    </div>
  );
}
