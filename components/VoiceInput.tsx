"use client"

import React, { useState, useRef } from 'react'

interface VoiceInputProps {
  onTranscription: (text: string) => void
  darkMode?: boolean
}

export default function VoiceInput({ onTranscription, darkMode = true }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const recognitionRef = useRef<any>(null)

  const startListening = () => {
    // Browser Speech Recognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in your browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let interimTranscript = ''

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcriptSegment + ' ')
        } else {
          interimTranscript += transcriptSegment
        }
      }

      // Show interim results
      setTranscript(prev => prev + interimTranscript)
    }

    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleUseTranscription = () => {
    onTranscription(transcript.trim())
    setTranscript('')
  }

  const handleClear = () => {
    setTranscript('')
    setError('')
  }

  return (
    <div className={`p-6 rounded-lg space-y-4 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        🎤 Voice Input
      </h3>

      {/* Status Display */}
      <div className={`p-4 rounded ${
        isListening
          ? darkMode ? 'bg-green-900/30 border-2 border-green-500' : 'bg-green-100 border-2 border-green-500'
          : darkMode ? 'bg-slate-700' : 'bg-slate-100'
      }`}>
        <p className={`text-sm font-bold ${
          isListening
            ? darkMode ? 'text-green-400' : 'text-green-600'
            : darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {isListening ? '🔴 Listening...' : 'Ready to record'}
        </p>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className={`p-4 rounded border-2 ${
          darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'
        }`}>
          <p className={`text-sm mb-2 font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Transcript:
          </p>
          <p className={darkMode ? 'text-white' : 'text-slate-900'}>
            {transcript}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={`p-3 rounded text-sm ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-4 py-2 rounded font-bold transition-all ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isListening ? '⏹️ Stop' : '🎤 Start Recording'}
        </button>

        {transcript && (
          <>
            <button
              onClick={handleUseTranscription}
              className="px-4 py-2 rounded font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all"
            >
              ✅ Use This
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded font-bold bg-slate-600 hover:bg-slate-700 text-white transition-all"
            >
              🗑️ Clear
            </button>
          </>
        )}
      </div>

      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        💡 Speak your dream description naturally. Click "Use This" to add it to your dream.
      </p>
    </div>
  )
}
