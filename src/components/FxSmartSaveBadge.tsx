import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TrendingDown, Info, ArrowRight } from 'lucide-react';

interface FxSmartSaveBadgeProps {
  savingsUSD: number;
  recommendedCurrency: string;
  recommendedAmountLocal: number;
  recommendedAmountUSD: number;
  breakdown?: Array<{
    currency: string;
    localAmount: number;
    convertedUSD: number;
    effectiveCostUSD: number;
    rate: number;
    feePercent: number;
  }>;
  onSelectCurrency?: (currency: string) => void;
  className?: string;
}

export function FxSmartSaveBadge({
  savingsUSD,
  recommendedCurrency,
  recommendedAmountLocal,
  recommendedAmountUSD,
  breakdown = [],
  onSelectCurrency,
  className = '',
}: FxSmartSaveBadgeProps) {
  const [open, setOpen] = useState(false);

  if (savingsUSD < 10) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 gap-1 ${className}`}
            >
              <TrendingDown className="h-3 w-3" />
              Save ${savingsUSD.toFixed(0)} in {recommendedCurrency}
            </Badge>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>We found a cheaper currency option using realtime FX rates.</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            FX-SmartSave Opportunity
          </DialogTitle>
          <DialogDescription>
            Save money by paying in a different currency
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Recommendation */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm text-muted-foreground mb-1">Recommended Payment</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {recommendedCurrency} {recommendedAmountLocal.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ ${recommendedAmountUSD.toFixed(2)} USD
            </div>
            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-500">
              You save ${savingsUSD.toFixed(2)} vs paying in USD
            </div>
          </div>

          {/* Breakdown */}
          {breakdown.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-1">
                <Info className="h-4 w-4 text-muted-foreground" />
                Currency Comparison
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {breakdown.map((item) => (
                  <div
                    key={item.currency}
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      item.currency === recommendedCurrency
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-muted/50'
                    }`}
                  >
                    <span className="font-medium">{item.currency}</span>
                    <span>{item.localAmount.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      ≈ ${item.effectiveCostUSD.toFixed(2)}
                    </span>
                    {item.currency === recommendedCurrency && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        Best
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                * Includes estimated {(breakdown[0]?.feePercent || 1).toFixed(1)}% conversion fee
              </p>
            </div>
          )}

          {/* CTA */}
          {onSelectCurrency && (
            <Button
              className="w-full"
              onClick={() => {
                onSelectCurrency(recommendedCurrency);
                setOpen(false);
              }}
            >
              Pay in {recommendedCurrency} (recommended)
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Exchange rates are indicative and may vary at time of payment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FxSmartSaveBadge;
