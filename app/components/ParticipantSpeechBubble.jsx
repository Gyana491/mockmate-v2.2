"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ParticipantSpeechBubble({ 
  type, 
  isSpeaking, 
  isProcessing, 
  labelText, 
  content, 
  isActive,
  liveTranscription,
  onContentChange, 
  isEditable = false,
  isPremium = false
}) {
  // Local state to manage edited content
  const [editedContent, setEditedContent] = useState(content || "");
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef(null);
  
  // Handle content changes
  const handleContentChange = (e) => {
    setEditedContent(e.target.value);
    if (onContentChange) {
      onContentChange(e.target.value);
    }
  };
  
  // Update local state when content prop changes
  useEffect(() => {
    if (content !== undefined && content !== null) {
      setEditedContent(content);
    }
  }, [content]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (contentRef.current && isEditable) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [editedContent, isEditable]);

  return (
    <div 
      className={`
        rounded-lg p-2 sm:p-3 border-l-2 mb-2 transition-all w-full max-w-full
        ${type === 'robot' 
          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20' 
          : 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
        }
        ${isSpeaking ? 'shadow-md' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium flex-wrap">
        <span className={`
          ${type === 'robot' 
            ? 'text-indigo-700 dark:text-indigo-400' 
            : 'text-emerald-700 dark:text-emerald-400'
          }
        `}>
          {labelText}
        </span>
        
        {isSpeaking && (
          <div className="flex items-center gap-1 ml-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`
                animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
                ${type === 'robot' ? 'bg-indigo-400' : 'bg-emerald-400'}
              `}></span>
              <span className={`
                relative inline-flex rounded-full h-1.5 w-1.5
                ${type === 'robot' ? 'bg-indigo-500' : 'bg-emerald-500'}
              `}></span>
            </span>
            <span className={`
              text-xs
              ${type === 'robot' ? 'text-indigo-600/70' : 'text-emerald-600/70'}
            `}>
              {type === 'robot' ? 'speaking' : 'recording'}
            </span>
          </div>
        )}
        
        {isProcessing && !isSpeaking && (
          <div className="flex items-center gap-1 ml-1">
            <svg className={`
              animate-spin h-1.5 w-1.5
              ${type === 'robot' ? 'text-indigo-500' : 'text-emerald-500'}
            `} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className={`
              text-xs
              ${type === 'robot' ? 'text-indigo-600/70' : 'text-emerald-600/70'}
            `}>
              processing
            </span>
          </div>
        )}
      </div>
      
      <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 break-words">
        {isSpeaking && liveTranscription ? (
          <div>
            <p>
              {liveTranscription}
              <span className={`
                inline-block w-0.5 h-[1em] ml-1 align-middle animate-pulse
                ${type === 'robot' ? 'bg-indigo-500' : 'bg-emerald-500'}
              `}></span>
            </p>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center gap-2 py-2 text-gray-500 dark:text-gray-400">
            <div className="flex items-end h-4 gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`
                    w-1 rounded-full animate-pulse delay-${i*100}
                    ${type === 'robot' ? 'bg-indigo-400' : 'bg-emerald-400'}
                  `}
                  style={{ 
                    height: `${6 + i * 2}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
            <span className="text-xs">Processing...</span>
          </div>
        ) : type === 'user' && isEditable && content !== null ? (
          <div className="relative">
            <textarea 
              ref={contentRef}
              className="w-full bg-transparent border-0 focus:ring-1 focus:ring-emerald-400 rounded text-sm resize-none py-0"
              value={editedContent}
              onChange={handleContentChange}
              placeholder="Your answer..."
              rows={1}
              aria-label="Edit your answer"
            />
            
            {isHovered && (
              <div className="absolute top-0 right-0 text-xs text-gray-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>Edit</span>
              </div>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap m-0">
            {content}
          </p>
        )}
      </div>
    </div>
  );
}