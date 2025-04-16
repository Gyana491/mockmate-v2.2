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
  // Let the caller configure continuous and interimResults
  // recognition.continuous = false; // REMOVED - Let caller decide
  // recognition.interimResults = true; // REMOVED - Let caller decide
  recognition.lang = 'en-US';

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
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          // Pass both interim and final transcripts, and a flag indicating if the *last* result segment is final
          callbacks.onResult(finalTranscript, interimTranscript, event.results[event.results.length - 1].isFinal);
        };
      }
      
      if (callbacks.onEnd) {
        recognition.onend = callbacks.onEnd;
      }
      
      if (callbacks.onError) {
        recognition.onerror = (event) => {
          callbacks.onError(event.error);
        };
      }

      if (callbacks.onStart) {
        recognition.onstart = callbacks.onStart;
      }

      if (callbacks.onNoMatch) {
        recognition.onnomatch = callbacks.onNoMatch;
      }

      if (callbacks.onAudioStart) {
        recognition.onaudiostart = callbacks.onAudioStart;
      }
    }
  }

  // Add methods to make it easier to use
  const originalStart = recognition.start;
  recognition.start = function() {
    try {
      originalStart.call(recognition);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (callbacks && callbacks.onError) {
        callbacks.onError(error.message || 'Failed to start speech recognition');
      }
    }
  };

  return recognition;
}
