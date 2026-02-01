import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload,
  Plus,
  Trash2,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { parseCSVData } from '@/lib/sampleData';
import { SKUData } from '@/types/inventory';
import { toast } from 'sonner';

const emptySkuForm: Omit<SKUData, 'id'> = {
  name: '',
  currentInventory: 100,
  dailySalesRate: 10,
  salesVariability: 20,
  leadTimeDays: 7,
  leadTimeVariability: 2,
  reorderPoint: 50,
  reorderQuantity: 100,
  unitCost: 25,
  holdingCostPercent: 18,
};

export default function InputPage() {
  const navigate = useNavigate();
  const { skus, setSkus, addSku, removeSku, loadSampleData, runAnalysis } = useInventory();
  const [newSku, setNewSku] = useState<Omit<SKUData, 'id'>>(emptySkuForm);
  const [showForm, setShowForm] = useState(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedData = parseCSVData(text);
      if (parsedData.length > 0) {
        setSkus(parsedData);
        toast.success(`Loaded ${parsedData.length} SKUs from CSV`);
      } else {
        toast.error('Could not parse CSV file');
      }
    };
    reader.readAsText(file);
  }, [setSkus]);

  const handleAddSku = () => {
    const id = `SKU-${String(skus.length + 1).padStart(4, '0')}`;
    addSku({ ...newSku, id });
    setNewSku(emptySkuForm);
    setShowForm(false);
    toast.success(`Added ${newSku.name || id}`);
  };

  const handleAnalyze = () => {
    runAnalysis();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Input</h1>
          <p className="text-muted-foreground mt-1">
            Add your inventory data manually, upload a CSV, or use sample data
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowForm(true)}>
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Add Manually</h3>
                <p className="text-sm text-muted-foreground">Enter SKU details one by one</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Upload CSV</h3>
                <p className="text-sm text-muted-foreground">Import from spreadsheet</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={loadSampleData}>
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Sample Data</h3>
                <p className="text-sm text-muted-foreground">Generate test inventory</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manual Entry Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Add New SKU</CardTitle>
                    <CardDescription>Enter the details for your inventory item</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    placeholder="e.g., Wireless Mouse Pro"
                    value={newSku.name}
                    onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Inventory</Label>
                  <Input
                    type="number"
                    value={newSku.currentInventory}
                    onChange={(e) => setNewSku({ ...newSku, currentInventory: +e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Daily Sales Rate</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newSku.dailySalesRate}
                    onChange={(e) => setNewSku({ ...newSku, dailySalesRate: +e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sales Variability (%)</Label>
                  <Input
                    type="number"
                    value={newSku.salesVariability}
                    onChange={(e) => setNewSku({ ...newSku, salesVariability: +e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lead Time (days)</Label>
                  <Input
                    type="number"
                    value={newSku.leadTimeDays}
                    onChange={(e) => setNewSku({ ...newSku, leadTimeDays: +e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Point</Label>
                  <Input
                    type="number"
                    value={newSku.reorderPoint}
                    onChange={(e) => setNewSku({ ...newSku, reorderPoint: +e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Quantity</Label>
                  <Input
                    type="number"
                    value={newSku.reorderQuantity}
                    onChange={(e) => setNewSku({ ...newSku, reorderQuantity: +e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Cost ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSku.unitCost}
                    onChange={(e) => setNewSku({ ...newSku, unitCost: +e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={handleAddSku}>Add SKU</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Current SKUs */}
        {skus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Current Inventory ({skus.length} SKUs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {skus.map((sku) => (
                  <div key={sku.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{sku.name || sku.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {sku.currentInventory} units • ${sku.unitCost}/unit • {sku.dailySalesRate} sales/day
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSku(sku.id)}
                      className="text-muted-foreground hover:text-risk-high"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="pt-6 flex justify-end">
                <Button onClick={handleAnalyze} size="lg" className="gap-2">
                  Analyze Risks
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CSV Format Help */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Format Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your CSV should include headers like: id, name, inventory, sales, lead_time, reorder_point, reorder_quantity, cost
            </p>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`id,name,inventory,sales,variability,lead_time,reorder_point,reorder_quantity,cost
SKU-001,Widget A,500,25,20,7,100,200,15.99
SKU-002,Widget B,1200,15,30,10,80,150,24.50`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
