'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { PortfolioHolding, Transaction } from '@/lib/types';
const Ctx = createContext<any>(null);
export function AtlasProvider({children}:{children:React.ReactNode}){ const [transactions,setTransactions]=useState<Transaction[]>([]); const [portfolio,setPortfolio]=useState<PortfolioHolding[]>([]); const v=useMemo(()=>({transactions,setTransactions,portfolio,setPortfolio}),[transactions,portfolio]); return <Ctx.Provider value={v}>{children}</Ctx.Provider>; }
export const useAtlas=()=>useContext(Ctx);
