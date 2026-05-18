import { run } from '@/app/api/_utils/handlers'; export async function POST(req: Request){ return run('summary', req as any); }
