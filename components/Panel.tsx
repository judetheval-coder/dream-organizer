import React from "react";

type PanelProps = {
  text: string;
  index?: number;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index?: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>, index?: number) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, index?: number) => void;
  dragging?: boolean;
};

export default function Panel({ text, index, onDragStart, onDragOver, onDrop, dragging }: PanelProps) {
  return (
    <div
      className={
        "comic-frame border-4 border-black bg-white p-6 rounded-lg shadow-md " +
        (dragging ? " dragging opacity-60 ring-4 ring-indigo-100" : "")
      }
      draggable
      onDragStart={(e) => { e.dataTransfer?.setData?.("text/plain", String(index)); onDragStart?.(e, index); }}
      onDragOver={(e) => { onDragOver?.(e, index); }}
      onDrop={(e) => { onDrop?.(e, index); }}
    >
      <div className="text-lg leading-snug">{text}</div>
    </div>
  );
}
