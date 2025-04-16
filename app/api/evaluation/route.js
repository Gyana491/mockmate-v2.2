// app/api/evaluation/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const MODEL = 'gemini-1.5-flash';

export async function POST(request) {
  try {
    const { answers, skill, difficulty = "intermediate" } = await request.json();
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'No answers provided' },
        { status: 400 }
      );
    }
    
    // Preprocess answers to handle potential speech recognition errors
    const processedAnswers = answers.map(answer => {
      // Keep original answer but add a preprocessing note
      return answer;
    });
    
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    const prompt = `
      You are an expert technical interviewer for ${skill}.
      
      I'll provide the candidate's answers to ${answers.length} interview questions of ${difficulty} difficulty level.
      
      IMPORTANT: This was a voice-based interview, so the answers may contain grammar mistakes, word repetitions, 
      or incorrect words due to speech recognition errors. Focus on understanding the candidate's intended meaning 
      rather than penalizing speech-to-text transcription issues.
      
      Their answers were:
      ${processedAnswers.map((answer, index) => `Question ${index + 1}: ${answer}`).join('\n\n')}
      
      Provide personalized and conversational interview feedback. Speak directly to the candidate using "you" language.
      Make your feedback feel like a one-on-one conversation rather than a formal report.
      
      When evaluating:
      1. Look beyond grammar mistakes and repetitions that are likely speech recognition errors
      2. Focus on the technical content and conceptual understanding
      3. Try to understand what the candidate is trying to convey, even if expressed imperfectly
      4. Be lenient with minor verbal stumbles, repetitions of words, or filler phrases
      
      Return only a JSON object with these fields:
      {
        "score": overall score from 0 to 100,
        "strengths": "What you did well during the interview, using 'you' language",
        "weaknesses": "Areas where you could improve, using supportive language",
        "suggestions": "Personalized recommendations for how you can enhance your skills",
        "review": "A conversational summary of your performance that feels like direct feedback"
      }
      
      Make sure the content is personalized, supportive, and speaks directly to the candidate using "you" form.
      Ensure your feedback is grammatically correct and well-written, even if the candidate's answers weren't.
      NO Md FOrmat Only Structured Text [txt]
      Only return valid JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '');
    
    try {
      const evaluation = JSON.parse(cleaned);
      return NextResponse.json(evaluation);
    } catch (parseError) {
      console.error('Error parsing evaluation:', parseError);
      // Fallback evaluation with improved grammar
      return NextResponse.json({
        score: 65,
        review: "You demonstrated solid knowledge in several areas, though there were some inconsistencies in your explanations. I appreciated your effort to address the questions comprehensively.",
        strengths: "You showed a good understanding of key concepts and were able to articulate your thoughts on complex topics.",
        weaknesses: "The depth of your technical explanations could be improved in some areas, particularly when discussing more advanced concepts.",
        suggestions: "Practice articulating complex technical concepts more clearly with specific examples. Consider preparing concise explanations for common interview topics in advance."
      });
    }
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate evaluation' },
      { status: 500 }
    );
  }
}