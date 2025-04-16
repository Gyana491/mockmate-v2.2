'use server';

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const MODEL = 'gemini-1.5-flash';

export async function POST(request) {
  try {
    const { question, answer, skill, difficulty = "intermediate" } = await request.json();
    
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Missing question or answer' },
        { status: 400 }
      );
    }
    
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    const prompt = `
      You are an encouraging and supportive technical interviewer for ${skill}.
      
      Question: "${question}"
      
      Candidate's Answer: "${answer}"
      
      The question is of ${difficulty} difficulty level.
      
      Your role is to provide personalized, conversational feedback as if speaking directly to the candidate. Balance encouragement with honest assessment:
      1. Use a warm, conversational tone (use "you" and "your" frequently)
      2. Specifically identify and praise what the candidate did well
      3. Clearly but kindly point out specific mistakes or misconceptions
      4. Focus on skill-building by explaining not just what to improve but why it matters
      5. For scoring, start from 50 as a base score for attempted answers and adjust based on accuracy and completeness
      
      For improvement suggestions:
      - Be specific about mistakes made and why they're problematic
      - Provide detailed, actionable advice on how to correct these mistakes
      - Include examples or specific techniques when helpful
      - Prioritize 2-3 improvement areas that would most enhance their skill level
      
      Return a JSON object with the following fields:
      {
        "feedback": "3-4 sentences of personalized feedback using 'you/your' that acknowledges strengths, identifies specific mistakes, and offers encouragement",
        "score": number between 0 and 100 (be fair: good attempts should score 70-85, strong answers 85-95),
        "strength": "strongest aspect of their answer in a personalized comment that speaks directly to the candidate", 
        "improvement": "specific, actionable suggestion addressing their biggest mistake, explaining both WHAT went wrong and HOW to improve it",
        "additionalImprovements": ["1-2 additional personalized improvement suggestions that clearly identify mistakes and offer specific remedies"]
      }
      
      Only return valid JSON.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/g, '');
      
      const evaluation = JSON.parse(cleaned);
      return NextResponse.json(evaluation);
    } catch (parseError) {
      console.error('Error parsing feedback:', parseError);
      // Fallback feedback
      return NextResponse.json({
        feedback: "Your answer shows good understanding of the concept. I appreciate your effort to address the key points. With a few more specific examples, your response would be even stronger.",
        score: 78,
        strength: "Good fundamental knowledge and clear explanation of the core concepts.",
        improvement: "Add 2-3 specific technical examples to illustrate your points - this will demonstrate deeper practical understanding."
      });
    }
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}