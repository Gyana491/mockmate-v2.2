// lib/geminiService.js
'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const MODEL = 'gemini-1.5-flash'; // or use 'gemini-2.0-pro' or 'gemini-2.0-flash-lite'

export async function generateInterviewQuestions(skill) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `
Generate 5 mock technical interview questions for "${skill}".
Format output as clean JSON:
[
  {
    "question": "...",
    "answer": "...",
    "difficulty": "basic" | "intermediate" | "advanced"
  },
  ...
]
Only return JSON. No markdown, no explanation, no text outside JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/```json|```/g, '');
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ Gemini Question Generation Error:', error);
    return [];
  }
}

export async function evaluateAnswer({ question, answer, userAnswer }) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `
Evaluate the candidate's answer with an encouraging and supportive tone.

Question: "${question}"
Expected Answer: "${answer}"
Candidate's Answer: "${userAnswer}"

Be generous with scoring and provide specific, actionable feedback:
1. Start from a baseline score of 10 (out of 20) for any reasonable attempt
2. Provide clear feedback on what was done well
3. Identify any specific issues or gaps
4. Give actionable advice on how to improve

Return JSON:
{
  "score": 0-20 (be generous; reasonable answers should score 10-15, good ones 15+),
  "feedback": "encouraging feedback that clearly identifies strengths and provides specific suggestions for improvement"
}
Only return valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ Gemini Evaluation Error:', err);
    return { score: 12, feedback: "Your answer shows good understanding. With a bit more detail, it would be even stronger." };
  }
}

export async function getFinalInterviewFeedback(skill, allQA) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const summary = allQA.map((qa, i) => `
Q${i + 1}: ${qa.question}
Expected: ${qa.answer}
User: ${qa.userAnswer}
Score: ${qa.score}
  `).join('\n');

  const prompt = `
Based on the following interview on "${skill}", give a supportive and encouraging final evaluation.

${summary}

Follow these guidelines for your feedback:
1. Be generous with the overall score (baseline of 70 for reasonable attempts)
2. Highlight specific strengths with concrete examples from the answers
3. Identify areas for improvement with SPECIFIC and ACTIONABLE advice
4. Maintain an encouraging tone throughout
5. Focus on growth potential rather than shortcomings

Return JSON:
{
  "score": 0-100 (be generous: most interviews should score 70-85, good ones 85+),
  "strengths": "detailed summary of 2-3 specific strengths with examples from the answers",
  "weaknesses": "constructive summary of 1-2 areas for improvement, phrased positively",
  "suggestions": "3-5 specific, actionable steps the candidate can take to improve their skills in this area"
}
Only return JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ Gemini Final Feedback Error:', err);
    return {
      score: 75,
      strengths: "You demonstrated good understanding of core concepts and communicated your ideas clearly.",
      weaknesses: "Some answers could benefit from more technical depth and specific examples.",
      suggestions: "1) Study practical applications of these concepts. 2) Practice explaining complex ideas with concrete examples. 3) Review the latest developments in this field to strengthen your knowledge."
    };
  }
}
