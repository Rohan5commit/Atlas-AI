from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.ensemble import IsolationForest

app = FastAPI(title='Atlas ML API')

class Tx(BaseModel):
    date:str
    merchant:str
    amount:float
    type:str

@app.get('/health')
def health(): return {'ok':True}

@app.post('/forecast')
def forecast(transactions: List[Tx]):
    spends = [t.amount for t in transactions if t.type=='debit']
    incomes = [t.amount for t in transactions if t.type=='credit']
    drift = (sum(incomes)-sum(spends))/180
    base = np.cumsum(np.repeat(drift,90))+2000
    return {'points':[{'day':i+1,'base':float(base[i]),'best':float(base[i]+12*np.sqrt(i+1)),'worst':float(base[i]-20*np.sqrt(i+1))} for i in range(90)]}

@app.post('/anomalies')
def anomalies(transactions: List[Tx]):
    x=np.array([[t.amount] for t in transactions if t.type=='debit'])
    if len(x)<5: return []
    model=IsolationForest(contamination=0.15, random_state=42).fit(x)
    p=model.predict(x)
    return [{'index':i,'amount':float(x[i][0]),'flag':'anomaly'} for i,v in enumerate(p) if v==-1]
