'use client';

export function createSpeechRecognizer({ onResult, onEnd, onError }) {
  // Check if the Speech Recognition API is available
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error("Speech recognition not supported in this browser.");
    if (onError) onError({ message: "Speech recognition not supported in this browser." });
    return null;
  }

  // Create recognition instance
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();

  // Configure the recognition
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.lang = 'en-US';

  let finalTranscript = '';
  let interimTranscript = '';

  // Event handlers
  recognizer.onresult = (event) => {
    interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Provide the transcript to the callback
    if (onResult) {
      onResult(finalTranscript || interimTranscript);
    }
  };

  recognizer.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    if (onError) onError(event);
  };

  recognizer.onend = () => {
    if (onEnd) onEnd(finalTranscript);
  };

  // Start recognition
  try {
    recognizer.start();
    console.log("Speech recognition started");
  } catch (e) {
    console.error("Error starting speech recognition:", e);
    if (onError) onError(e);
    return null;
  }

  // Return an object with control methods
  return {
    stop: () => {
      try {
        recognizer.stop();
        console.log("Speech recognition stopped");
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
      }
    },
    abort: () => {
      try {
        recognizer.abort();
        console.log("Speech recognition aborted");
      } catch (e) {
        console.error("Error aborting speech recognition:", e);
      }
    }
  };
}
