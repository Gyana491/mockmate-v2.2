"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RobotAvatar from "./components/RobotAvatar";

export default function Home() {
  const router = useRouter();
  const [skill, setSkill] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [customQuestionCount, setCustomQuestionCount] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isRobotSpeaking, setIsRobotSpeaking] = useState(false);

  // Add robot interaction handler
  const handleRobotInteraction = () => {
    setIsRobotSpeaking(true);
    setTimeout(() => setIsRobotSpeaking(false), 2000);
  };

  // Interview categories with skill mappings
  const categories = [
    { 
      name: "Technical Interview", 
      icon: "💻", 
      description: "Practice coding and system design",
      defaultSkills: ["JavaScript", "Python", "Java", "System Design"]
    },
    { 
      name: "Behavioral Interview", 
      icon: "🤝", 
      description: "Master common behavioral questions",
      defaultSkills: ["Leadership", "Communication", "Problem Solving", "Teamwork"]
    },
    { 
      name: "System Design", 
      icon: "🏗️", 
      description: "Learn to design scalable systems",
      defaultSkills: ["System Design", "Architecture", "Scalability", "Database Design"]
    },
    { 
      name: "Problem Solving", 
      icon: "🧩", 
      description: "Improve your analytical skills",
      defaultSkills: ["Algorithms", "Data Structures", "Logic", "Problem Solving"]
    },
    { 
      name: "Communication", 
      icon: "💬", 
      description: "Enhance your speaking skills",
      defaultSkills: ["Communication", "Presentation", "Public Speaking"]
    },
    { 
      name: "Leadership", 
      icon: "👥", 
      description: "Develop leadership qualities",
      defaultSkills: ["Leadership", "Management", "Team Building", "Strategy"]
    }
  ];

  // Common technical skills
  const commonSkills = [
    "JavaScript", "React", "Python", "Node.js", "Java", 
    "C#", "SQL", "AWS", "Docker", "TypeScript"
  ];


  // How It Works steps with actions
  const workflowSteps = [
    {
      icon: "🎯",
      title: "1. Choose Your Topic",
      description: "Select from various interview topics and skills",
      action: () => document.getElementById("categories-title")?.scrollIntoView({ behavior: "smooth" })
    },
    {
      icon: "💬",
      title: "2. Practice",
      description: "Engage in realistic interview conversations",
      action: () => document.getElementById("quick-practice-title")?.scrollIntoView({ behavior: "smooth" })
    },
    {
      icon: "📈",
      title: "3. Improve",
      description: "Get feedback and track your progress",
      action: () => {
        setSkill("JavaScript");
        setDifficulty("intermediate");
        setQuestionCount(5);
        document.getElementById("quick-practice-title")?.scrollIntoView({ behavior: "smooth" });
      }
    }
  ];

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    // Set a default skill from the category
    if (category.defaultSkills?.length > 0) {
      setSkill(category.defaultSkills[0]);
    }
    // Scroll to quick practice section
    document.getElementById("quick-practice-title")?.scrollIntoView({ behavior: "smooth" });
  };

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

  // Construct the interview URL with parameters
  const getInterviewUrl = () => {
    if (!skill) return "#";
    let url = `/interview/${encodeURIComponent(skill)}`;
    url += `?difficulty=${difficulty}&count=${questionCount}`;
    return url;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section with Robot */}
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            MockMate
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your AI-powered interview practice companion. Practice anytime, improve continuously.
          </motion.p>
          
          {/* Centered Robot Avatar */}
          <motion.div
            className="flex justify-center items-center mb-12"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative cursor-pointer" onClick={handleRobotInteraction}>
              <RobotAvatar isSpeaking={isRobotSpeaking} size={200} />
              <motion.div 
                className="absolute -right-4 -bottom-4 bg-blue-600 text-white rounded-full p-3 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 500, damping: 15 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Quick Practice Section - Moved Up */}
        <section className="mb-16" aria-labelledby="quick-practice-title">
          <div className="max-w-4xl mx-auto">
            <h2 
              id="quick-practice-title"
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center"
            >
              Start Practicing Now
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Rest of Quick Practice section content */}
              <div className="p-6 space-y-8">
                {/* Skill Selection */}
                <div className="space-y-4">
                  <label 
                    htmlFor="skill-search" 
                    className="block text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    What would you like to practice?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="skill-search"
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      placeholder="Type a programming language or technology..."
                      className="w-full pl-10 pr-12 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
                      aria-describedby="skill-hint"
                    />
                    {skill && (
                      <button 
                        onClick={() => setSkill("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Clear selection"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p id="skill-hint" className="text-sm text-gray-500 dark:text-gray-400">
                    Choose from popular skills below or type to search
                  </p>

                  {/* Popular Skills */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {commonSkills.map((commonSkill) => (
                      <motion.button
                        key={commonSkill}
                        onClick={() => setSkill(commonSkill)}
                        className={`group relative px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                          skill === commonSkill 
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300" 
                            : "border-gray-200 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-500"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className={`text-sm font-medium ${
                          skill === commonSkill
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}>
                          {commonSkill}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Interview Settings */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: skill ? 1 : 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Difficulty Selection */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="difficulty" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Select difficulty level
                      </label>
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-4 py-3.5 text-base border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: `right 0.5rem center`,
                          backgroundSize: `1.5em 1.5em`
                        }}
                      >
                        <option value="basic">Basic - For beginners</option>
                        <option value="intermediate">Intermediate - Some experience</option>
                        <option value="advanced">Advanced - Experienced professionals</option>
                        <option value="mixed">Mixed - Variety of questions</option>
                      </select>
                    </div>

                    {/* Question Count */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label 
                          htmlFor={customQuestionCount ? "custom-count" : "question-count"} 
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Number of questions
                        </label>
                        <button 
                          onClick={toggleCustomCount}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                        >
                          {customQuestionCount ? "Use presets" : "Custom value"}
                        </button>
                      </div>

                      {customQuestionCount ? (
                        <div className="relative">
                          <input
                            type="number"
                            id="custom-count"
                            min="1"
                            max="50"
                            value={questionCount}
                            onChange={handleQuestionCountChange}
                            className="w-full px-4 py-3.5 text-base border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                            aria-describedby="question-count-hint"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm pointer-events-none">
                            questions
                          </div>
                        </div>
                      ) : (
                        <select
                          id="question-count"
                          value={questionCount}
                          onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                          className="w-full px-4 py-3.5 text-base border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: `right 0.5rem center`,
                            backgroundSize: `1.5em 1.5em`
                          }}
                        >
                          <option value="5">5 questions (~10 minutes)</option>
                          <option value="10">10 questions (~20 minutes)</option>
                          <option value="15">15 questions (~30 minutes)</option>
                          <option value="20">20 questions (~40 minutes)</option>
                        </select>
                      )}
                      <p id="question-count-hint" className="text-xs text-gray-500 dark:text-gray-400">
                        Choose between 1-50 questions
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Start Interview Button */}
                <motion.div
                  className="pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link 
                    href={getInterviewUrl()}
                    className={`block w-full py-4 px-6 rounded-xl text-center font-semibold text-lg transition-all duration-300 ${
                      skill 
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={(e) => !skill && e.preventDefault()}
                    aria-disabled={!skill}
                    role="button"
                    tabIndex={skill ? 0 : -1}
                  >
                    {skill ? (
                      <span className="flex items-center justify-center gap-2">
                        Start Interview
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </span>
                    ) : (
                      "Select a skill to continue"
                    )}
                  </Link>
                  {skill && (
                    <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                      Ready to practice {skill} at {difficulty} level
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Interview Categories Section */}
        <section className="mb-16" aria-labelledby="categories-title">
          <h2 
            id="categories-title"
            className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center"
          >
            Choose Your Interview Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.name}
                className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl border-2 transition-all duration-300 ${
                  activeCategory?.name === category.name 
                    ? "border-blue-500 dark:border-blue-400" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {category.description}
                </p>
                <button 
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeCategory?.name === category.name
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Start Practice
                </button>
              </motion.div>
            ))}
          </div>
        </section>


        {/* How It Works Section */}
        <section className="text-center mb-12" aria-labelledby="workflow-title">
          <h2 
            id="workflow-title"
            className="text-2xl font-bold text-gray-800 dark:text-white mb-8"
          >
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="flex-1 max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.button
                  onClick={step.action}
                  className="w-full h-full p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-4xl mb-4 animate-bounce">{step.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                  <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1">
                    Try it now
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
