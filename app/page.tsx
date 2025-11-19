"use client"

import React, { useEffect, useRef, useState } from "react";
import Panel from "../components/Panel";

export default function Page(): JSX.Element {
  const [dreamText, setDreamText] = useState<string>("");
  const [panels, setPanels] = useState<string[]>([]);
  const [mergeShort, setMergeShort] = useState<boolean>(true);
  const draggingIndexRef = useRef<number | null>(null);
  const STORAGE_KEY = "dream-organizer-panels";

  function generatePanelsFromText(text: string) {
    const trimmed = text?.trim();
    if (!trimmed) return [];

    const matches = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    let result = matches.map((s) => s.trim()).filter(Boolean);

    if (mergeShort) {
      const threshold = 20;
      const merged: string[] = [];
      for (const m of result) {
        if (m.length < threshold && merged.length > 0) {
          merged[merged.length - 1] = merged[merged.length - 1] + " " + m;
        } else {
          merged.push(m);
        }
      }
      result = merged;
    }

    return result;
  }

  function handleGenerate() {
    const result = generatePanelsFromText(dreamText);
    setPanels(result);
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPanels(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
    } catch (e) {}
  }, [panels]);

  function onDragStart(e: React.DragEvent<HTMLDivElement>, index?: number) {
    draggingIndexRef.current = index ?? null;
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>, _index?: number) {
    e.preventDefault();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, index?: number) {
    e.preventDefault();
    const fromIndex = draggingIndexRef.current;
    const toIndex = typeof index === "number" ? index : null;
    if (fromIndex == null || toIndex == null || fromIndex === toIndex) return;
    const next = [...panels];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    setPanels(next);
    draggingIndexRef.current = null;
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">Dream Organizer 🌙</h1>
        <p className="text-gray-600 mt-2">Type a dream below and split it into comic-style panels.</p>
      </header>

      <section className="space-y-4">
        <label htmlFor="dream" className="block text-sm font-medium text-gray-700">Your dream</label>
        <textarea
          id="dream"
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          placeholder="I was flying..."
          rows={8}
          className="w-full rounded-lg p-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />

        <div className="flex gap-3">
          <button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            Generate Panels
          </button>

          <button onClick={() => { setDreamText(""); setPanels([]); }} className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md">
            Clear
          </button>

          <button onClick={() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(panels)); alert("Saved to localStorage."); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md">
            Save locally
          </button>

          <label className="ml-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={mergeShort} onChange={(e) => setMergeShort(e.target.checked)} />
            Merge short sentences
          </label>
        </div>
      </section>

      <hr />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Panels</h2>
        {panels.length === 0 ? (
          <p className="text-gray-600">Press "Generate Panels" to split your dream into comic panels.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {panels.map((p, i) => (
              <Panel
                key={i}
                index={i}
                text={p}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                dragging={draggingIndexRef.current === i}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
