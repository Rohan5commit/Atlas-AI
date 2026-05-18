import { run } from '@/app/api/_utils/handlers';
export async function POST(req: Request){ return run('forecast', req as any); }
