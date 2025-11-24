"use client"

import { useCallback, useEffect } from 'react'
import { useVoiceRecording } from '@/hooks/useInteractions'
import { colors, gradients } from '@/lib/design'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  existingText?: string
  className?: string
}

export default function VoiceInput({ onTranscript, existingText = '', className = '' }: VoiceInputProps) {
  const {
    isRecording,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoiceRecording()

  // Update parent when transcript changes
  useEffect(() => {
    if (transcript) {
      onTranscript(existingText + transcript)
    }
  }, [transcript, existingText, onTranscript])

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      clearTranscript()
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording, clearTranscript])

  if (!isSupported) {
    return null // Don't show if not supported
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleToggleRecording}
        className={`
          relative px-4 py-2 rounded-xl font-semibold transition-all 
          hover:scale-105 active:scale-95 flex items-center gap-2
          ${isRecording ? 'animate-pulse' : ''}
        `}
        style={{
          background: isRecording 
            ? `linear-gradient(135deg, #dc2626, #ef4444)` 
            : gradients.button,
          color: colors.white,
          boxShadow: isRecording 
            ? '0 0 20px rgba(220, 38, 38, 0.5)' 
            : '0 0 20px rgba(124, 58, 237, 0.3)',
        }}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording ? (
          <>
            <span className="relative flex h-3 w-3">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: colors.white }}
              />
              <span 
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ background: colors.white }}
              />
            </span>
            <span>Recording...</span>
          </>
        ) : (
          <>
            <span>🎤</span>
            <span>Voice</span>
          </>
        )}
      </button>

      {error && (
        <span 
          className="text-sm px-3 py-1 rounded-lg"
          style={{ background: '#dc262620', color: '#dc2626' }}
        >
          {error}
        </span>
      )}

      {isRecording && (
        <div 
          className="flex items-center gap-1"
          style={{ color: colors.textMuted }}
        >
          <span className="text-sm">Listening</span>
          <span className="flex gap-0.5">
            <span className="w-1 h-3 rounded-full animate-bounce" style={{ background: colors.cyan, animationDelay: '0ms' }} />
            <span className="w-1 h-4 rounded-full animate-bounce" style={{ background: colors.purple, animationDelay: '150ms' }} />
            <span className="w-1 h-3 rounded-full animate-bounce" style={{ background: colors.pink, animationDelay: '300ms' }} />
          </span>
        </div>
      )}
    </div>
  )
}
