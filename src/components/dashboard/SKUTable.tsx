import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { SKUData, RiskAnalysis } from '@/types/inventory';
import { getRiskLevel } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SKUTableProps {
  skus: SKUData[];
  analyses: Map<string, RiskAnalysis>;
}

const riskBadgeStyles = {
  low: 'bg-risk-low/10 text-risk-low border-risk-low/20',
  medium: 'bg-risk-medium/10 text-risk-medium border-risk-medium/20',
  high: 'bg-risk-high/10 text-risk-high border-risk-high/20',
};

const riskIcons = {
  low: CheckCircle,
  medium: AlertTriangle,
  high: AlertCircle,
};

export function SKUTable({ skus, analyses }: SKUTableProps) {
  if (skus.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">No inventory data loaded. Add data to see risk analysis.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">SKU</TableHead>
            <TableHead className="font-semibold">Product</TableHead>
            <TableHead className="text-right font-semibold">Stock</TableHead>
            <TableHead className="text-right font-semibold">Daily Sales</TableHead>
            <TableHead className="text-center font-semibold">Understock</TableHead>
            <TableHead className="text-center font-semibold">Overstock</TableHead>
            <TableHead className="text-center font-semibold">Dead Stock</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skus.map((sku, index) => {
            const analysis = analyses.get(sku.id);
            const understockLevel = analysis ? getRiskLevel(analysis.understockRisk) : 'low';
            const overstockLevel = analysis ? getRiskLevel(analysis.overstockRisk) : 'low';
            const deadStockLevel = analysis ? getRiskLevel(analysis.deadInventoryRisk) : 'low';
            
            const UnderstockIcon = riskIcons[understockLevel];
            const OverstockIcon = riskIcons[overstockLevel];
            const DeadStockIcon = riskIcons[deadStockLevel];

            return (
              <motion.tr
                key={sku.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-mono text-sm">{sku.id}</TableCell>
                <TableCell className="font-medium">{sku.name}</TableCell>
                <TableCell className="text-right">{sku.currentInventory.toLocaleString()}</TableCell>
                <TableCell className="text-right">{sku.dailySalesRate}</TableCell>
                <TableCell className="text-center">
                  {analysis ? (
                    <Badge variant="outline" className={cn('gap-1', riskBadgeStyles[understockLevel])}>
                      <UnderstockIcon className="h-3 w-3" />
                      {analysis.understockRisk}%
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {analysis ? (
                    <Badge variant="outline" className={cn('gap-1', riskBadgeStyles[overstockLevel])}>
                      <OverstockIcon className="h-3 w-3" />
                      {analysis.overstockRisk}%
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {analysis ? (
                    <Badge variant="outline" className={cn('gap-1', riskBadgeStyles[deadStockLevel])}>
                      <DeadStockIcon className="h-3 w-3" />
                      {analysis.deadInventoryRisk}%
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Link to={`/sku/${sku.id}`}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}
