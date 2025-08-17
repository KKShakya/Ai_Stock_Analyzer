"use client";
import React from "react";

const dummyOI = {
  strikes: [
    // CE/PE on each strike
    { strike: 22400, ceOI: 1370000, peOI: 2380000 },
    { strike: 22500, ceOI: 1440000, peOI: 2880000 },
    { strike: 22600, ceOI: 1920000, peOI: 1820000 },
    { strike: 22700, ceOI: 2100000, peOI: 1270000 }
  ],
  pcr: 1.16,
  dominance: {
    side: "PE",
    percentage: 24,
    range: [22400, 22500],
    commentary: "PE writers dominating 22400–22500 by 24%. Likely support zone."
  }
};

export default function OISentimentCard() {
  return (
    <div className="rounded-lg shadow p-4 bg-white dark:bg-card">
      <div className="font-semibold mb-2">OI Sentiment</div>
      <div className="flex gap-3 text-xs mb-2">
        <span>PCR: <b>{dummyOI.pcr}</b></span>
        <span className={`font-medium px-2 rounded ${dummyOI.pcr > 1 ? "bg-green-100 text-green-600" : dummyOI.pcr < 1 ? "bg-red-100 text-red-600" : ""}`}>
          {dummyOI.pcr > 1 ? "Bullish" : dummyOI.pcr < 1 ? "Bearish" : "Neutral"}
        </span>
      </div>
      <div className="flex gap-4 flex-wrap mb-2">
        {dummyOI.strikes.map(s => (
          <div key={s.strike} className="text-center">
            <div className="font-bold">{s.strike}</div>
            <div>CE: {s.ceOI / 1000}k</div>
            <div>PE: {s.peOI / 1000}k</div>
          </div>
        ))}
      </div>
      <div className="text-sm mt-2">{dummyOI.dominance.commentary}</div>
    </div>
  );
}
