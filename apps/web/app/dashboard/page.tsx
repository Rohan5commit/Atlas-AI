import Link from 'next/link';
import { DashboardCore } from '@/components/dashboard';
export default function P(){return <div className='space-y-4'><h2 className='text-3xl font-semibold'>Dashboard</h2><DashboardCore/><div className='flex flex-wrap gap-2'>{['spending','forecast','portfolio','scenario','ask-atlas','summary'].map(p=><Link key={p} className='btn' href={`/${p}`}>{p}</Link>)}</div></div>}
