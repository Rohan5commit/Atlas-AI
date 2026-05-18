import './globals.css';
import Link from 'next/link';
import { AtlasProvider } from '@/components/state';

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang='en'><body><AtlasProvider><div className='min-h-screen bg-slate-950 text-slate-100'><header className='border-b border-slate-800 p-4 flex gap-4'><Link href='/'>Atlas AI</Link><Link href='/demo'>Try demo</Link><Link href='/architecture'>Architecture</Link></header><main className='p-6 max-w-6xl mx-auto'>{children}</main></div></AtlasProvider></body></html>
}
