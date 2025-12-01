"use client"

import { useState, FormEvent } from 'react'

type MoodOption = 'happy' | 'neutral' | 'anxious' | 'scared' | 'excited' | 'sad' | 'peaceful'
type FormState = { title: string; description: string; sleepDate: string; vividness: number; mood: MoodOption; category: string; emoji: string; isLucid: boolean; isNightmare: boolean; isRecurring: boolean; tags: string; people: string; places: string }
type DraftDream = Omit<FormState, 'tags' | 'people' | 'places'> & { id: number; tags: string[]; people: string[]; places: string[]; status: 'recent'; notes: string[]; createdAt: string; updatedAt: string }

const EMOJIS = ['💭', '🌙', '✨', '🦋', '🌈', '🔮', '🌟', '🦅', '🌊', '🏔️']
const CATEGORIES = ['Adventure', 'Mystery', 'Nightmare', 'Memory', 'Fantasy', 'Lucid', 'Symbolic', 'Flying', 'Other']
const MOODS: { key: MoodOption; emoji: string }[] = [{ key: 'happy', emoji: '😊' }, { key: 'neutral', emoji: '😐' }, { key: 'anxious', emoji: '😰' }, { key: 'scared', emoji: '😱' }, { key: 'excited', emoji: '🤩' }, { key: 'sad', emoji: '😢' }, { key: 'peaceful', emoji: '😌' }]
const INPUT = "w-full bg-[rgba(30,30,30,0.7)] border border-[rgba(138,43,226,0.3)] rounded-2xl p-4 text-white placeholder-[#666] focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)]"
const LABEL = "block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3"
const BTN_ACTIVE = "bg-gradient-to-br from-[#5B2CFC] to-[#8A2BE2] scale-105"
const BTN_INACTIVE = "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
const initForm = (): FormState => ({ title: '', description: '', sleepDate: new Date().toISOString().split('T')[0], vividness: 3, mood: 'neutral', category: 'Adventure', emoji: '💭', isLucid: false, isNightmare: false, isRecurring: false, tags: '', people: '', places: '' })

export default function NewDreamModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (d: DraftDream) => void }) {
  const [f, setF] = useState<FormState>(initForm())
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF({ ...f, [k]: v })
  const split = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave({ ...f, id: Date.now(), tags: split(f.tags), people: split(f.people), places: split(f.places), status: 'recent', notes: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    setF(initForm()); onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-[#1E1E1E] border border-[rgba(138,43,226,0.3)] rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modalIn" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#5B2CFC] to-[#03DAC6] bg-clip-text text-transparent">✨ Record New Dream</h2>
          <button onClick={onClose} className="text-[#B0B0B0] hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Emoji */}
          <div>
            <label className={LABEL}>Choose Icon</label>
            <div className="flex gap-3 flex-wrap">
              {EMOJIS.map(e => <button key={e} type="button" onClick={() => set('emoji', e)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all ${f.emoji === e ? BTN_ACTIVE : BTN_INACTIVE}`}>{e}</button>)}
            </div>
          </div>

          {/* Title & Description */}
          <div><label className={LABEL}>Dream Title</label><input type="text" required value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g., Flying Over the City" className={INPUT} /></div>
          <div><label className={LABEL}>Description</label><textarea required value={f.description} onChange={e => set('description', e.target.value)} placeholder="Describe what happened..." rows={4} className={INPUT} /></div>
          <div><label className={LABEL}>When did you have this dream?</label><input type="date" required value={f.sleepDate} onChange={e => set('sleepDate', e.target.value)} className={INPUT} /></div>

          {/* Vividness */}
          <div>
            <label className={LABEL}>Vividness ({f.vividness}/5) {'⭐'.repeat(f.vividness)}</label>
            <input type="range" min="1" max="5" value={f.vividness} onChange={e => set('vividness', +e.target.value)} className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[#8A2BE2]" />
          </div>

          {/* Mood */}
          <div>
            <label className={LABEL}>Mood</label>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => <button key={m.key} type="button" onClick={() => set('mood', m.key)} className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${f.mood === m.key ? BTN_ACTIVE : BTN_INACTIVE}`}><span className="text-xl">{m.emoji}</span><span className="text-sm capitalize">{m.key}</span></button>)}
            </div>
          </div>

          {/* Category */}
          <div><label className={LABEL}>Category</label><select value={f.category} onChange={e => set('category', e.target.value)} className={INPUT}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>

          {/* Checkboxes */}
          <div className="flex gap-4 flex-wrap">
            {[{ k: 'isLucid' as const, l: '✨ Lucid Dream', c: 'accent-[#8A2BE2]' }, { k: 'isNightmare' as const, l: '😱 Nightmare', c: 'accent-red-500' }, { k: 'isRecurring' as const, l: '🔁 Recurring', c: 'accent-purple-500' }].map(x => (
              <label key={x.k} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f[x.k]} onChange={e => set(x.k, e.target.checked)} className={`w-5 h-5 rounded ${x.c}`} /><span className="text-white">{x.l}</span></label>
            ))}
          </div>

          {/* Tags, People, Places */}
          <div><label className={LABEL}>Tags (comma-separated)</label><input type="text" value={f.tags} onChange={e => set('tags', e.target.value)} placeholder="flying, city, colors" className={INPUT} /></div>
          <div><label className={LABEL}>People (comma-separated)</label><input type="text" value={f.people} onChange={e => set('people', e.target.value)} placeholder="Mom, old friend, stranger" className={INPUT} /></div>
          <div><label className={LABEL}>Places (comma-separated)</label><input type="text" value={f.places} onChange={e => set('places', e.target.value)} placeholder="beach, childhood home" className={INPUT} /></div>

          <button type="submit" className="w-full bg-gradient-to-r from-[#5B2CFC] to-[#03DAC6] hover:from-[#6B3CFF] hover:to-[#13EAD6] text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-[rgba(91,44,252,0.5)]">💾 Save Dream</button>
        </form>
      </div>
    </div>
  )
}
