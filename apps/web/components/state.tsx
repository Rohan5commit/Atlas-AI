'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { PortfolioHolding, Transaction } from '@/lib/types';

interface AtlasContextType {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  portfolio: PortfolioHolding[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioHolding[]>>;
}

const Ctx = createContext<AtlasContextType | null>(null);

export function AtlasProvider({children}:{children:React.ReactNode}){ 
  const [transactions,setTransactions]=useState<Transaction[]>([]); 
  const [portfolio,setPortfolio]=useState<PortfolioHolding[]>([]); 
  const v=useMemo(()=>({transactions,setTransactions,portfolio,setPortfolio}),[transactions,portfolio]); 
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>; 
}

export const useAtlas=()=>{
  const context = useContext(Ctx);
  if(!context) throw new Error('useAtlas must be used within an AtlasProvider');
  return context;
};
