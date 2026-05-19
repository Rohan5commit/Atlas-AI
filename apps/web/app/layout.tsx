import './globals.css';
import { AtlasProvider } from '@/components/state';

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang='en' className='scroll-smooth'><body><AtlasProvider>{children}</AtlasProvider></body></html>
}
