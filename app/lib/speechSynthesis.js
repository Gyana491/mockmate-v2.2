// lib/speechSynthesis.js
'use client';

export function speakText(text, callbacks = {}) {
  // Check if the browser supports speech synthesis
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported in this browser");
    if (callbacks.onError) callbacks.onError({ type: 'not-supported', message: "Speech synthesis not supported" });
    return;
  }

  // Create a new utterance instance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set utterance properties
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Select a voice (prefer a natural-sounding female voice)
  const voices = window.speechSynthesis.getVoices();
  
  // Wait for voices to be loaded if they aren't available yet
  if (voices.length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      setVoice(utterance, updatedVoices);
    }, { once: true });
  } else {
    setVoice(utterance, voices);
  }

  // Set up event handlers
  utterance.onstart = () => {
    if (callbacks.onStart) callbacks.onStart();
  };

  utterance.onend = () => {
    if (callbacks.onEnd) callbacks.onEnd();
  };

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event);
    if (callbacks.onError) callbacks.onError(event);
  };

  // Speak the text
  try {
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Error starting speech synthesis:", error);
    if (callbacks.onError) callbacks.onError({ type: 'error', message: error.message });
  }
}

// Helper function to select the best voice
function setVoice(utterance, voices) {
  if (!voices || voices.length === 0) return;

  // Preferred voices in order (common ones across multiple platforms)
  const preferredVoices = [
    'Google UK English Female',
    'Microsoft Zira',
    'Samantha',
    'Female'
  ];

  // Try to find one of the preferred voices
  let selectedVoice = null;
  
  for (const preferred of preferredVoices) {
    const match = voices.find(voice => 
      voice.name.includes(preferred) || 
      voice.lang.startsWith('en-')
    );
    
    if (match) {
      selectedVoice = match;
      break;
    }
  }

  // If no preferred voice was found, use the first English voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.lang.startsWith('en-')) || voices[0];
  }

  // Set the selected voice
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
}
