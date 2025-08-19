
export interface ChartPoint {
  date: string;    // e.g., "2025-08-16"
  close: number;
}

export interface MarketChartResponse {
  index: string;          // Name of the index
  prices: ChartPoint[];   // Time series data
}
