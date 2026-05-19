import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className='flex flex-col gap-24 py-12'>
      <section className='relative text-center space-y-8 pt-12'>
        <div className='absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full -z-10' />
        <h1 className='text-6xl md:text-8xl font-black tracking-tight leading-none text-gradient'>
          Financial Intelligence.<br />
          <span className='text-cyan-400'>Atlas AI.</span>
        </h1>
        <p className='text-xl text-slate-400 max-w-2xl mx-auto'>
          Your grounded financial copilot. Deterministic analytics meets Generative AI to map your fiscal trajectory.
        </p>
        <div className='flex justify-center gap-4 pt-4'>
          <Button asChild size='lg' className='px-10 rounded-full'><Link href='/demo'>Launch Copilot</Link></Button>
          <Button asChild variant='secondary' size='lg' className='px-10 rounded-full'><Link href='/architecture'>How it works</Link></Button>
        </div>
      </section>

      <section className='grid md:grid-cols-3 gap-6'>
        <Card className='md:col-span-2 p-8'>
          <h3 className='text-2xl font-bold mb-4'>Precision Analytics</h3>
          <p className='text-slate-400'>Raw data is noisy. We convert your transactions into deterministic 30/90-day cashflow models with volatility-aware forecasting.</p>
        </Card>
        <Card className='p-8'>
          <h3 className='text-2xl font-bold mb-4'>Grounded AI</h3>
          <p className='text-slate-400'>Llama-3.1 context-injection ensures your advisor only speaks to the data in front of you.</p>
        </Card>
      </section>
    </div>
  )
}
