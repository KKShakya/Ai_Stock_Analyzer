import { Router } from 'express';
import type { Request, Response } from 'express';
import fetch from 'node-fetch';
import { env } from '../config/env';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ service: 'api-gateway', status: 'ok', time: new Date().toISOString() });
});

router.get('/stocks/sample', async (_req: Request, res: Response) => {
  const r = await fetch(`${env.dataUrl}/sample`);
  res.status(r.status).json(await r.json());
});

router.post('/stocks/analyze', async (req: Request, res: Response) => {
  const r = await fetch(`${env.sentimentUrl}/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  res.status(r.status).json(await r.json());
});

router.post('/strategies/validate', async (req: Request, res: Response) => {
  const r = await fetch(`${env.strategyUrl}/validate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  res.status(r.status).json(await r.json());
});

export default router;
