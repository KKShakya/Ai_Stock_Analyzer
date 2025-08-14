export const dummyStockData = {
  ticker: "TSLA",
  price: 361.23,
  changePercent: 36.32,
  chart: [
    { date: "2024-01", value: 220 },
    { date: "2024-02", value: 240 },
    { date: "2024-03", value: 250 },
    { date: "2024-04", value: 280 },
    { date: "2024-05", value: 300 },
    { date: "2024-06", value: 320 }
  ],
  stats: {
    revenue: "13.2%",
    grossMargin: "25.03%",
    roe: "31.03%"
  },
  options: [
    {
      strikePrice: 350,
      type: "CE",
      openInterest: 15000,
      changeInOI: 800,
      volume: 4200,
      lastPrice: 20,
      delta: 0.65,
      gamma: 0.04
    },
    {
      strikePrice: 350,
      type: "PE",
      openInterest: 11000,
      changeInOI: -400,
      volume: 3100,
      lastPrice: 14,
      delta: -0.45,
      gamma: 0.03
    },
    {
      strikePrice: 360,
      type: "CE",
      openInterest: 12000,
      changeInOI: 500,
      volume: 3500,
      lastPrice: 15,
      delta: 0.6,
      gamma: 0.05
    },
    {
      strikePrice: 360,
      type: "PE",
      openInterest: 9000,
      changeInOI: -300,
      volume: 2800,
      lastPrice: 12,
      delta: -0.4,
      gamma: 0.04
    },
    {
      strikePrice: 370,
      type: "CE",
      openInterest: 8000,
      changeInOI: 300,
      volume: 2200,
      lastPrice: 10,
      delta: 0.55,
      gamma: 0.03
    },
    {
      strikePrice: 370,
      type: "PE",
      openInterest: 9500,
      changeInOI: 200,
      volume: 2700,
      lastPrice: 13,
      delta: -0.5,
      gamma: 0.02
    }
  ],
  sentiment: {
    score: 0.75,
    label: "Bullish"
  },
  tradeSignal: "BUY"
};
