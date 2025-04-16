// lib/speechSynthesis.js
'use client';

export function speakText(text, callbacks) {
  console.log('Initializing speech synthesis for text:', text);

  // Check if running in browser environment
  if (typeof window === 'undefined') {
    console.error('Speech Synthesis is only available in client-side environments');
    if (callbacks && callbacks.onError) callbacks.onError({error: 'client-side-only'});
    if (callbacks && callbacks.onEnd) callbacks.onEnd();
    return;
  }
  
  // Ensure text is not empty
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.error('Invalid text provided for speech synthesis.');
    if (callbacks && callbacks.onError) callbacks.onError({error: 'invalid-text'});
    if (callbacks && callbacks.onEnd) callbacks.onEnd();
    return;
  }

  if (!window.speechSynthesis) {
    console.error('Speech Synthesis API not supported in this browser.');
    if (callbacks && callbacks.onError) callbacks.onError({error: 'not-supported'});
    if (callbacks && callbacks.onEnd) callbacks.onEnd();
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Safety check - if speech is blocked, use a user interaction
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1; // Ensure volume is at maximum

    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (voices.length === 0) {
      let voicesAttempts = 0;
      const maxVoiceAttempts = 3;
      
      const voicesLoadedCallback = () => {
        voices = window.speechSynthesis.getVoices();
        voicesAttempts++;
        
        if (voices.length > 0) {
          // Set voice and speak once voices are loaded
          setVoiceAndSpeak(utterance);
          // Remove the event listener
          window.speechSynthesis.onvoiceschanged = null;
        } else if (voicesAttempts >= maxVoiceAttempts) {
          // After several attempts, try without specific voice
          console.warn('Failed to load voices after multiple attempts. Using default voice.');
          setVoiceAndSpeak(utterance, true);
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
      
      window.speechSynthesis.onvoiceschanged = voicesLoadedCallback;
      // Try to load voices
      window.speechSynthesis.getVoices();
      
      // Set a fallback timeout in case onvoiceschanged never fires
      setTimeout(() => {
        if (voices.length === 0) {
          console.warn('Voice loading timed out. Using default voice.');
          setVoiceAndSpeak(utterance, true);
          window.speechSynthesis.onvoiceschanged = null;
        }
      }, 3000);
      
      return;
    }
    
    // If voices are already available, speak right away
    setVoiceAndSpeak(utterance);
  } catch (error) {
    console.error('Unexpected error initializing speech synthesis:', error);
    if (callbacks && callbacks.onError) callbacks.onError({error: 'initialization-error'});
    if (callbacks && callbacks.onEnd) callbacks.onEnd();
  }
  
  function setVoiceAndSpeak(utterance, useDefaultVoice = false) {
    try {
      if (!useDefaultVoice) {
        // Find a good English voice, preferably Google or Microsoft
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          (voice.name.includes('Google') || voice.name.includes('Microsoft')) && 
          voice.lang.startsWith('en')
        ) || voices.find(voice => voice.lang.startsWith('en-')) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('Using voice:', preferredVoice.name);
        }
      }
      
      // Set callbacks before speaking
      if (callbacks) {
        if (typeof callbacks === 'function') {
          utterance.onend = callbacks;
        } else {
          if (callbacks.onStart) utterance.onstart = callbacks.onStart;
          
          // Create wrapped onEnd callback
          const originalOnEnd = callbacks.onEnd;
          utterance.onend = (event) => {
            clearTimeout(timeoutId);
            if (originalOnEnd) originalOnEnd(event);
          };
          
          // Create wrapped onError callback
          const originalOnError = callbacks.onError;
          utterance.onerror = (event) => {
            clearTimeout(timeoutId);
            console.error('Speech synthesis error:', event);
            
            // Provide more detailed error information
            const errorInfo = {
              type: event.error || 'unknown',
              message: 'Speech synthesis failed',
              originalEvent: event
            };
            
            if (originalOnError) originalOnError(errorInfo);
            // Always call onEnd on error to ensure UI cleanup
            if (callbacks.onEnd) callbacks.onEnd(event);
          };
        }
      }
      
      // Failsafe timeout - prevent speech from running too long
      const timeoutId = setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          console.warn('Speech synthesis timeout - cleaning up');
          window.speechSynthesis.cancel();
          if (callbacks && callbacks.onEnd) callbacks.onEnd();
        }
      }, 30000); // 30 seconds should be enough for any reasonable speech
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      // Chrome sometimes pauses after ~15 seconds
      // Keep speech synthesis active with periodic resume calls
      const resumeInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(resumeInterval);
        }
      }, 10000);
      
      // Clear interval on end or error
      utterance.addEventListener('end', () => clearInterval(resumeInterval));
      utterance.addEventListener('error', () => clearInterval(resumeInterval));
    } catch (error) {
      console.error('Error setting voice or speaking:', error);
      if (callbacks && callbacks.onError) callbacks.onError({error: 'speak-error'});
      if (callbacks && callbacks.onEnd) callbacks.onEnd();
    }
  }
}
