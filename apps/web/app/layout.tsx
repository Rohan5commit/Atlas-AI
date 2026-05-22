import './globals.css';
import { AtlasProvider } from '@/components/state';

export const metadata = {
  title: "Atlas AI — Financial Copilot for Students",
  description: "Turn your transaction data into forecasts, risk insights, and action plans.",
  openGraph: {
    title: "Atlas AI",
    description: "Turn your transaction data into forecasts, risk insights, and action plans.",
    url: "https://atlas-ai-sigma-six.vercel.app",
    type: "website",
  },
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang='en' className='scroll-smooth'><body><AtlasProvider>{children}</AtlasProvider></body></html>
}
