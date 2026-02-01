import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { SKUData, RiskAnalysis, DashboardMetrics } from '@/types/inventory';
import { analyzeRisk, calculateDashboardMetrics } from '@/lib/simulation';
import { generateSampleData } from '@/lib/sampleData';

interface InventoryContextType {
  skus: SKUData[];
  analyses: Map<string, RiskAnalysis>;
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  setSkus: (skus: SKUData[]) => void;
  addSku: (sku: SKUData) => void;
  updateSku: (id: string, sku: Partial<SKUData>) => void;
  removeSku: (id: string) => void;
  loadSampleData: () => void;
  runAnalysis: () => void;
  getAnalysis: (skuId: string) => RiskAnalysis | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [skus, setSkusState] = useState<SKUData[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, RiskAnalysis>>(new Map());
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setSkus = useCallback((newSkus: SKUData[]) => {
    setSkusState(newSkus);
    setAnalyses(new Map());
    setMetrics(null);
  }, []);

  const addSku = useCallback((sku: SKUData) => {
    setSkusState(prev => [...prev, sku]);
  }, []);

  const updateSku = useCallback((id: string, updates: Partial<SKUData>) => {
    setSkusState(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const removeSku = useCallback((id: string) => {
    setSkusState(prev => prev.filter(s => s.id !== id));
    setAnalyses(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const loadSampleData = useCallback(() => {
    const sampleSkus = generateSampleData(12);
    setSkusState(sampleSkus);
    setAnalyses(new Map());
    setMetrics(null);
  }, []);

  const runAnalysis = useCallback(() => {
    setIsLoading(true);
    
    // Run analysis asynchronously to not block UI
    setTimeout(() => {
      const newAnalyses = new Map<string, RiskAnalysis>();
      const analysisArray: RiskAnalysis[] = [];
      
      skus.forEach(sku => {
        const analysis = analyzeRisk(sku);
        newAnalyses.set(sku.id, analysis);
        analysisArray.push(analysis);
      });
      
      setAnalyses(newAnalyses);
      setMetrics(calculateDashboardMetrics(skus, analysisArray));
      setIsLoading(false);
    }, 100);
  }, [skus]);

  const getAnalysis = useCallback((skuId: string) => {
    return analyses.get(skuId);
  }, [analyses]);

  const value = useMemo(() => ({
    skus,
    analyses,
    metrics,
    isLoading,
    setSkus,
    addSku,
    updateSku,
    removeSku,
    loadSampleData,
    runAnalysis,
    getAnalysis,
  }), [skus, analyses, metrics, isLoading, setSkus, addSku, updateSku, removeSku, loadSampleData, runAnalysis, getAnalysis]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
