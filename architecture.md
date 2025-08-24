# System Architecture

## Service Communication Flow
Frontend → API Gateway → Microservices → External APIs

## Services Overview
| Service | Port | Purpose | Dependencies |
|---------|------|---------|-------------|
| API Gateway | 8080 | Request routing, CORS | All services |
| Market Service | 5003 | NIFTY, SENSEX, VIX data | Alpha Vantage API |
| OI Service | 5002 | PCR, Options analysis | NSE API |
| AI Service | 5004 | Strategy suggestions | OpenAI/Local LLM |

## Data Flow Diagrams
[Include your architecture diagrams here]
