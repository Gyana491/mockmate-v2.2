'use client';

export function createSpeechRecognizer(callbacks) {
  // Check if the browser is client-side
  if (typeof window === 'undefined') {
    console.error('Speech Recognition is only available in client-side environments');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error('Speech Recognition API not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  
  // Set default settings for better recognition
  recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
  
  // Tracking state
  let isListening = false;
  let autoRestartCount = 0;
  let silenceTimer = null;
  const MAX_AUTO_RESTARTS = 3;
  const SILENCE_TIMEOUT = 5000; // 5 seconds of silence before auto-restart
  
  // Store accumulated transcripts between restarts
  let accumulatedFinalTranscript = '';

  if (callbacks) {
    if (typeof callbacks === 'function') {
      // If callbacks is a function, treat it as onResult
      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        callbacks(transcript);
      };
    } else {
      // If callbacks is an object with different callback types
      if (callbacks.onResult) {
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
              // Also add to accumulated transcript
              accumulatedFinalTranscript += ' ' + event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          // Reset silence timer since we received results
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(handleSilence, SILENCE_TIMEOUT);
          }
          
          // Pass both interim and final transcripts, and a flag indicating if the *last* result segment is final
          // Also pass the accumulated transcript for long-running sessions
          callbacks.onResult(
            finalTranscript, 
            interimTranscript, 
            event.results[event.results.length - 1].isFinal,
            accumulatedFinalTranscript.trim()
          );
        };
      }
      
      // Enhanced onEnd handler with auto-restart capability
      const originalOnEnd = callbacks.onEnd;
      recognition.onend = () => {
        console.log('Speech recognition ended');
        
        // Clear silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        
        // Check if we should auto-restart
        if (isListening && autoRestartCount < MAX_AUTO_RESTARTS) {
          console.log(`Auto-restarting speech recognition (attempt ${autoRestartCount + 1}/${MAX_AUTO_RESTARTS})`);
          autoRestartCount++;
          try {
            // Short delay before restarting
            setTimeout(() => {
              recognition.start();
              // Set a new silence timer
              silenceTimer = setTimeout(handleSilence, SILENCE_TIMEOUT);
            }, 100);
          } catch (error) {
            console.error('Error auto-restarting speech recognition:', error);
            isListening = false;
            if (originalOnEnd) originalOnEnd();
          }
        } else {
          isListening = false;
          if (originalOnEnd) originalOnEnd();
        }
      };
      
      // Enhanced error handler
      const originalOnError = callbacks.onError;
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific errors
        if (event.error === 'network') {
          // Network errors might be temporary, try restarting
          setTimeout(() => {
            if (isListening) {
              try {
                recognition.stop();
                setTimeout(() => recognition.start(), 1000);
              } catch (e) {
                console.error('Error restarting after network error:', e);
              }
            }
          }, 1000);
        }
        
        if (originalOnError) {
          originalOnError(event.error);
        }
      };

      if (callbacks.onStart) {
        const originalOnStart = callbacks.onStart;
        recognition.onstart = () => {
          console.log('Speech recognition started');
          isListening = true;
          // Reset silence timer
          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(handleSilence, SILENCE_TIMEOUT);
          originalOnStart();
        };
      } else {
        recognition.onstart = () => {
          console.log('Speech recognition started');
          isListening = true;
          // Reset silence timer
          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(handleSilence, SILENCE_TIMEOUT);
        };
      }

      if (callbacks.onNoMatch) {
        recognition.onnomatch = callbacks.onNoMatch;
      }

      if (callbacks.onAudioStart) {
        recognition.onaudiostart = callbacks.onAudioStart;
      }
    }
  }
  
  // Handle long periods of silence
  function handleSilence() {
    console.log('Silence detected, restarting recognition to keep listening');
    if (isListening) {
      try {
        recognition.stop();
        // onend handler will auto-restart if needed
      } catch (e) {
        console.error('Error stopping recognition during silence handling:', e);
      }
    }
  }

  // Enhanced methods
  const enhancedRecognition = {
    start: function(options = {}) {
      try {
        // Configure recognition based on options
        if (options.continuous !== undefined) {
          recognition.continuous = options.continuous;
        }
        
        if (options.interimResults !== undefined) {
          recognition.interimResults = options.interimResults;
        } else {
          // Default to true for better experience
          recognition.interimResults = true;
        }
        
        // Reset counters
        autoRestartCount = 0;
        accumulatedFinalTranscript = '';
        
        // Start recognition
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        if (callbacks && callbacks.onError) {
          callbacks.onError(error.message || 'Failed to start speech recognition');
        }
      }
    },
    
    stop: function() {
      isListening = false;
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    },
    
    abort: function() {
      isListening = false;
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      try {
        recognition.abort();
      } catch (error) {
        console.error('Error aborting speech recognition:', error);
      }
    },
    
    // Get accumulated transcript
    getAccumulatedTranscript: function() {
      return accumulatedFinalTranscript.trim();
    },
    
    // Reset accumulated transcript
    resetTranscript: function() {
      accumulatedFinalTranscript = '';
    },
    
    // Check if currently listening
    isListening: function() {
      return isListening;
    }
  };

  return enhancedRecognition;
}
