import './globals.css';
import Link from 'next/link';
import { AtlasProvider } from '@/components/state';

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang='en'><body><AtlasProvider><div className='min-h-screen bg-slate-950 text-slate-100'><header className='sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800 p-4 flex justify-between items-center'><div className='flex gap-6 items-center'><Link href='/' className='font-bold text-xl tracking-tight'>Atlas AI</Link><nav className='hidden md:flex gap-6 text-sm font-medium text-slate-400'><Link href='/demo' className='hover:text-cyan-400 transition-colors'>Demo</Link><Link href='/architecture' className='hover:text-cyan-400 transition-colors'>Architecture</Link></nav></div><Link href='/demo' className='btn text-xs px-3 py-1'>Get Started</Link></header><main className='p-6 max-w-6xl mx-auto'>{children}</main></div></AtlasProvider></body></html>
}
