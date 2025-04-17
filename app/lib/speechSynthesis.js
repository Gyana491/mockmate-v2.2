// lib/speechSynthesis.js
'use client';

export function speakText(text, callbacks) {
  console.log('Initializing speech synthesis for text:', text);

  // Guard against empty text
  if (!text || text.trim() === '') {
    console.log("Empty text provided to speech synthesis, skipping");
    if (callbacks && callbacks.onEnd) {
      setTimeout(() => callbacks.onEnd(), 0);
    }
    return;
  }

  // Check if running in browser environment
  if (typeof window === 'undefined') {
    console.error('Speech Synthesis is only available in client-side environments');
    if (callbacks && callbacks.onError) callbacks.onError({error: 'client-side-only'});
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
  
  // Track if onEnd has been called to prevent multiple calls
  let onEndCalled = false;
  
  const safeOnEnd = (event) => {
    if (!onEndCalled && callbacks && callbacks.onEnd) {
      onEndCalled = true;
      callbacks.onEnd(event);
    }
  };
  
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
          setVoiceAndSpeak(utterance);
          window.speechSynthesis.removeEventListener('voiceschanged', voicesLoadedCallback);
        } else if (voicesAttempts >= maxVoiceAttempts) {
          // If we tried several times with no luck, use default voice
          console.warn('Could not load voices after multiple attempts, using default voice');
          setVoiceAndSpeak(utterance, true);
          window.speechSynthesis.removeEventListener('voiceschanged', voicesLoadedCallback);
        }
      };
      
      window.speechSynthesis.addEventListener('voiceschanged', voicesLoadedCallback);
      
      // Trigger the callback once manually in case the event doesn't fire
      voicesLoadedCallback();
    } else {
      setVoiceAndSpeak(utterance);
    }

    function setVoiceAndSpeak(utterance, useDefaultVoice = false) {
      if (!useDefaultVoice) {
        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        let voice = null;
        
        // Try to find these voices in order of preference
        const preferredVoices = [
          { name: 'Google US English', lang: 'en-US' },
          { name: 'Microsoft David', lang: 'en-US' },
          { name: 'Microsoft Mark', lang: 'en-US' },
          { name: 'Microsoft Zira', lang: 'en-US' },
          { name: 'Alex', lang: 'en-US' }
        ];
        
        for (const preferred of preferredVoices) {
          voice = voices.find(v => 
            v.name === preferred.name && 
            v.lang.startsWith(preferred.lang)
          );
          if (voice) break;
        }
        
        // If we couldn't find a preferred voice, try any English US voice
        if (!voice) {
          voice = voices.find(v => v.lang.startsWith('en-US'));
        }
        
        // If we still couldn't find a voice, try any English voice
        if (!voice) {
          voice = voices.find(v => v.lang.startsWith('en'));
        }
        
        // If we found a suitable voice, use it
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      // Add callbacks if provided
      if (callbacks) {
        // Create wrapped onEnd callback
        const originalOnEnd = callbacks.onEnd;
        utterance.onend = (event) => {
          console.log("Speech synthesis onend event triggered");
          clearTimeout(timeoutId);
          safeOnEnd(event);
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
          safeOnEnd(event);
        };
      }
      
      // Add safety check before speaking
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 100);
      } else {
        window.speechSynthesis.speak(utterance);
      }
      
      // Shorter timeout to prevent hanging speech - max 8 seconds per utterance
      const timeoutId = setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          console.warn('Speech synthesis timeout - cleaning up');
          window.speechSynthesis.cancel();
          safeOnEnd();
        }
      }, 8000);
      
      // Handle Chrome's speech pausing issue with more frequent checks
      let resumeAttempts = 0;
      const resumeInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          resumeAttempts++;
          
          // After too many attempts, just force end the speech
          if (resumeAttempts > 5) {
            console.warn("Too many resume attempts, ending speech");
            clearInterval(resumeInterval);
            window.speechSynthesis.cancel();
            safeOnEnd();
            return;
          }
          
          try {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } catch (e) {
            console.error("Error during speech resume:", e);
          }
        } else {
          clearInterval(resumeInterval);
        }
      }, 2000); // Check every 2 seconds
      
      // Clear interval on end or error
      utterance.addEventListener('end', () => clearInterval(resumeInterval));
      utterance.addEventListener('error', () => clearInterval(resumeInterval));
    }
  } catch (error) {
    console.error('Failed to initialize speech synthesis:', error);
    if (callbacks && callbacks.onError) {
      callbacks.onError({
        type: 'initialization-error',
        message: 'Failed to initialize speech synthesis',
        originalError: error
      });
    }
    safeOnEnd();
  }
}
