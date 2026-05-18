import { run } from '@/app/api/_utils/handlers';
export async function POST(req: Request){ return run('anomalies', req as any); }
