// app/api/question/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const MODEL = 'gemini-1.5-flash';
// Questions cache to avoid repeated API calls
const questionsCache = {};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get('skill') || 'JavaScript';
  const difficulty = searchParams.get('difficulty') || 'intermediate'; 
  const count = parseInt(searchParams.get('count') || '5');
  const getAllQuestions = searchParams.get('all') === 'true';
  
  // Create a cache key that includes all parameters
  const cacheKey = `${skill}_${difficulty}_${count}`;
  
  // Check if we have cached questions for this combination
  if (!questionsCache[cacheKey]) {
    // Generate questions for this skill
    try {
      const model = genAI.getGenerativeModel({ model: MODEL });
      
      // Modify prompt based on difficulty
      let difficultyPrompt = '';
      if (difficulty === 'basic') {
        difficultyPrompt = 'basic level questions suitable for beginners';
      } else if (difficulty === 'intermediate') {
        difficultyPrompt = 'intermediate level questions for those with some experience';
      } else if (difficulty === 'advanced') {
        difficultyPrompt = 'advanced questions for experienced professionals';
      } else if (difficulty === 'mixed') {
        difficultyPrompt = 'a mix of basic, intermediate, and advanced questions';
      }
      
      const prompt = `
        Generate ${count} mock technical interview questions for "${skill}".
        Focus on ${difficultyPrompt}.
        Format output as JSON:
        [
          {
            "question": "...",
            "answer": "...",
            "difficulty": "basic" | "intermediate" | "advanced"
          },
          ...
        ]
        Ensure you generate exactly ${count} questions.
        Only return valid JSON.
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/g, '');
      
      let parsedData = JSON.parse(cleaned);
      
      // Ensure we have exactly the requested number of questions
      if (parsedData.length > count) {
        parsedData = parsedData.slice(0, count);
      }
      
      questionsCache[cacheKey] = parsedData;
    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Create fallback questions
      questionsCache[cacheKey] = generateFallbackQuestions(skill, difficulty, count);
    }
  }
  
  // Return all questions if requested
  if (getAllQuestions) {
    return NextResponse.json({ questions: questionsCache[cacheKey] });
  }
  
  // Otherwise return the question at the specified index
  const index = parseInt(searchParams.get('index') || '0');
  const questions = questionsCache[cacheKey];
  if (index >= 0 && index < questions.length) {
    return NextResponse.json({ question: questions[index].question });
  } else {
    return NextResponse.json(
      { error: 'Question index out of range' },
      { status: 400 }
    );
  }
}

// Helper function to generate fallback questions
function generateFallbackQuestions(skill, difficulty, count) {
  const basicQuestions = [
    {
      question: `What are the core concepts of ${skill}?`,
      answer: `This would typically cover the fundamental principles of ${skill}.`,
      difficulty: 'basic'
    },
    {
      question: `Explain the basic syntax and structure of ${skill}.`,
      answer: `The basic syntax includes...`,
      difficulty: 'basic'
    },
    {
      question: `What development environments or tools are commonly used with ${skill}?`,
      answer: `Common tools include...`,
      difficulty: 'basic'
    }
  ];
  
  const intermediateQuestions = [
    {
      question: `Explain how you would implement a complex feature in ${skill}.`,
      answer: `A good answer would discuss the architecture, design patterns, and best practices in ${skill}.`,
      difficulty: 'intermediate'
    },
    {
      question: `How do you handle errors and exceptions in ${skill}?`,
      answer: `Best practices include proper error handling strategies such as...`,
      difficulty: 'intermediate'
    },
    {
      question: `How do you ensure code quality when working with ${skill}?`,
      answer: `Code quality can be ensured through testing, code reviews, and following best practices like...`,
      difficulty: 'intermediate'
    }
  ];
  
  const advancedQuestions = [
    {
      question: `What are the latest developments in ${skill} and how would you use them?`,
      answer: `Recent developments include... and they can be used for...`,
      difficulty: 'advanced'
    },
    {
      question: `Describe how you would optimize performance in a large-scale ${skill} application.`,
      answer: `Performance optimization techniques include...`,
      difficulty: 'advanced'
    },
    {
      question: `How would you architect a distributed system using ${skill}?`,
      answer: `A distributed architecture would involve...`,
      difficulty: 'advanced'
    }
  ];
  
  // Select questions based on difficulty
  let questionPool = [];
  if (difficulty === 'basic') {
    questionPool = basicQuestions;
  } else if (difficulty === 'intermediate') {
    questionPool = intermediateQuestions;
  } else if (difficulty === 'advanced') {
    questionPool = advancedQuestions;
  } else {
    // For mixed, use all questions
    questionPool = [...basicQuestions, ...intermediateQuestions, ...advancedQuestions];
  }
  
  // Ensure we have enough questions
  while (questionPool.length < count) {
    questionPool = [...questionPool, ...questionPool];
  }
  
  // Return exactly the requested number
  return questionPool.slice(0, count);
}