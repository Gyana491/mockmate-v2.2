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
    utterance.rate = 0.95; // Slightly slower rate for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1; // Ensure volume is at maximum

    // Split long text into manageable chunks to prevent cutting off
    const textChunks = splitTextIntoChunks(text, 150);
    let currentChunkIndex = 0;

    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (voices.length === 0) {
      let voicesAttempts = 0;
      const maxVoiceAttempts = 5; // Increased from 3 to 5 for more attempts
      
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

    function splitTextIntoChunks(text, maxChunkLength) {
      const sentences = text.split(/(?<=[.!?])\s+/);
      const chunks = [];
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length <= maxChunkLength) {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = sentence;
        }
      }
      
      if (currentChunk) chunks.push(currentChunk);
      return chunks.length ? chunks : [text];
    }

    function speakNextChunk() {
      if (currentChunkIndex < textChunks.length) {
        const chunkUtterance = new SpeechSynthesisUtterance(textChunks[currentChunkIndex]);
        chunkUtterance.lang = utterance.lang;
        chunkUtterance.rate = utterance.rate;
        chunkUtterance.pitch = utterance.pitch;
        chunkUtterance.volume = utterance.volume;
        chunkUtterance.voice = utterance.voice;
        
        chunkUtterance.onend = () => {
          currentChunkIndex++;
          if (currentChunkIndex < textChunks.length) {
            setTimeout(speakNextChunk, 100); // Small pause between chunks
          } else {
            safeOnEnd({type: 'natural'});
          }
        };
        
        chunkUtterance.onerror = (event) => {
          console.error('Chunk speech error:', event);
          // Try to continue with next chunk if possible
          currentChunkIndex++;
          if (currentChunkIndex < textChunks.length) {
            setTimeout(speakNextChunk, 100);
          } else {
            if (callbacks && callbacks.onError) {
              callbacks.onError({
                type: event.error || 'unknown',
                message: 'Chunk speech synthesis failed',
                originalEvent: event
              });
            }
            safeOnEnd({type: 'error'});
          }
        };
        
        window.speechSynthesis.speak(chunkUtterance);
        
        // Apply the resume hack for this chunk too
        let attempts = 0;
        const resumeInterval = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            attempts++;
            if (attempts > 10) { // Allow more attempts
              clearInterval(resumeInterval);
              return;
            }
            try {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            } catch (e) {
              console.error("Error during chunk speech resume:", e);
            }
          } else {
            clearInterval(resumeInterval);
          }
        }, 1500); // Slightly more frequent checks
      }
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
      
      // Instead of using the original utterance, start the chunked approach
      speakNextChunk();
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
