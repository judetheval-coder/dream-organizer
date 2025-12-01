"use client"

import { useState, useEffect, useCallback, useRef, TouchEvent } from 'react'

type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number // Minimum distance to trigger swipe
}

export function useSwipe(options: UseSwipeOptions = {}) {
  const { 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown, 
    threshold = 50 
  } = options

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Determine if swipe was horizontal or vertical
    if (absX > absY && absX > threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        setSwipeDirection('right')
        onSwipeRight?.()
      } else {
        setSwipeDirection('left')
        onSwipeLeft?.()
      }
    } else if (absY > absX && absY > threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        setSwipeDirection('down')
        onSwipeDown?.()
      } else {
        setSwipeDirection('up')
        onSwipeUp?.()
      }
    }

    touchStartRef.current = null
    
    // Reset swipe direction after animation
    setTimeout(() => setSwipeDirection(null), 300)
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])

  return {
    swipeDirection,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  }
}

// Auto-save hook with debounce
interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void> | void
  delay?: number // Debounce delay in ms
  enabled?: boolean
}

export function useAutoSave<T>({ 
  data, 
  onSave, 
  delay = 1000, 
  enabled = true 
}: UseAutoSaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataRef = useRef<string>('')

  useEffect(() => {
    if (!enabled) return

    const dataString = JSON.stringify(data)
    
    // Don't save if data hasn't changed
    if (dataString === lastDataRef.current) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      setError(null)
      
      try {
        await onSave(data)
        lastDataRef.current = dataString
        setLastSaved(new Date())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save')
      } finally {
        setIsSaving(false)
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave, delay, enabled])

  // Force save immediately
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsSaving(true)
    setError(null)
    
    try {
      await onSave(data)
      lastDataRef.current = JSON.stringify(data)
      setLastSaved(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [data, onSave])

  return {
    isSaving,
    lastSaved,
    error,
    saveNow,
  }
}

// Drag and drop reorder hook
export function useDragReorder<T>(
  items: T[],
  onReorder: (items: T[]) => void
) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    const newItems = [...items]
    const [draggedItem] = newItems.splice(dragIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)
    
    onReorder(newItems)
    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex, items, onReorder])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  return {
    dragIndex,
    dragOverIndex,
    getDragProps: (index: number) => ({
      draggable: true,
      onDragStart: () => handleDragStart(index),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
      onDrop: (e: React.DragEvent) => handleDrop(e, index),
      onDragEnd: handleDragEnd,
    }),
  }
}

// Voice recording hook
interface ISpeechRecognition {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  start?: () => void
  stop?: () => void
  onresult?: (e: { resultIndex: number; results: Array<{ isFinal: boolean; 0: { transcript: string } }> }) => void
  onerror?: (e: { error: string }) => void
  onend?: () => void
}

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    const w = window as unknown as Record<string, unknown>
    return !!(w['SpeechRecognition'] || w['webkitSpeechRecognition'])
  })
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  useEffect(() => {
    // Check for browser support
    type SRConstructor = new () => {
      continuous?: boolean
      interimResults?: boolean
      lang?: string
      onresult?: (e: { resultIndex: number; results: Array<{ isFinal: boolean; 0: { transcript: string } }> }) => void
      onerror?: (e: { error: string }) => void
      onend?: () => void
      start?: () => void
      stop?: () => void
    }
    const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor }
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: { resultIndex: number; results: Array<{ isFinal: boolean; 0: { transcript: string } }> }) => {
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' '
          }
        }

        setTranscript(prev => prev + finalTranscript)
      }

      recognition.onerror = (event: { error: string }) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition as ISpeechRecognition
    }

      return () => {
      if (recognitionRef.current && recognitionRef.current.stop) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || !recognitionRef.current.start) {
      setError('Speech recognition not supported')
      return
    }

    setError(null)
    setIsRecording(true)
    recognitionRef.current.start()
  }, [])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && recognitionRef.current.stop) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isRecording,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  }
}
