"use client";
import React, { useState } from "react";

export default function AIStrategyChatCard() {
  const [input, setInput] = useState("");
  const dummyReply = "Detected: PE OI dominates at 22400–22500 by 24%. Bullish; ideal to consider support-based strategies.";

  return (
    <div className="rounded-lg shadow p-4 bg-white dark:bg-card flex flex-col h-full">
      <div className="font-semibold mb-2">AI Strategy Assistant</div>
      <textarea
        value={input}
        rows={2}
        placeholder="Describe rule (e.g., PE OI > 20% than CE)..."
        className="rounded border p-2 mb-2"
        onChange={e => setInput(e.target.value)}
      />
      <button className="bg-primary text-white px-3 py-1 rounded w-fit self-end mb-2">Submit</button>
      <div className="text-xs bg-muted p-2 rounded mt-auto">
        <span className="font-bold">AI:</span> {dummyReply}
      </div>
    </div>
  );
}
