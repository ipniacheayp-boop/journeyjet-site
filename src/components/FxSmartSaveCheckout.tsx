import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TrendingDown, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';
import { useFxHedgeSuggestion } from '@/hooks/useFxSmartSave';

interface FxSmartSaveCheckoutProps {
  savingsUSD: number;
  recommendedCurrency: string;
  recommendedAmountLocal: number;
  recommendedAmountUSD: number;
  originalCurrency: string;
  originalAmount: number;
  travelDate?: string;
  onCurrencySelect?: (useRecommended: boolean, currency: string) => void;
  className?: string;
}

export function FxSmartSaveCheckout({
  savingsUSD,
  recommendedCurrency,
  recommendedAmountLocal,
  recommendedAmountUSD,
  originalCurrency,
  originalAmount,
  travelDate,
  onCurrencySelect,
  className = '',
}: FxSmartSaveCheckoutProps) {
  const [isOpen, setIsOpen] = useState(savingsUSD >= 10);
  const [useRecommended, setUseRecommended] = useState(false);
  
  const { data: hedgeData } = useFxHedgeSuggestion(travelDate, recommendedCurrency);

  const handleCheckboxChange = (checked: boolean) => {
    setUseRecommended(checked);
    onCurrencySelect?.(checked, checked ? recommendedCurrency : originalCurrency);
  };

  // Don't show if savings are minimal
  if (savingsUSD < 5) {
    return null;
  }

  return (
    <Card className={`border-green-200 dark:border-green-800 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span>💱 FX-SmartSave Recommendation</span>
                {savingsUSD >= 10 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Save ${savingsUSD.toFixed(0)}
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Recommendation Details */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Pay in {recommendedCurrency}</div>
                  <div className="text-xl font-bold">
                    {recommendedCurrency} {recommendedAmountLocal.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ ${recommendedAmountUSD.toFixed(2)} USD
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">vs {originalCurrency}</div>
                  <div className="text-lg line-through text-muted-foreground">
                    ${originalAmount.toFixed(2)}
                  </div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    Save ${savingsUSD.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox to use recommended currency */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-recommended-currency"
                checked={useRecommended}
                onCheckedChange={handleCheckboxChange}
              />
              <label
                htmlFor="use-recommended-currency"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Use recommended currency for payment
              </label>
            </div>

            {/* Hedging Suggestion for long-term bookings */}
            {hedgeData?.showHedgingSuggestion && (
              <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  <strong>Long-term booking notice:</strong> Your travel date is {hedgeData.daysUntilTravel} days away. 
                  Exchange rates may fluctuate. Consider locking today's rate if your payment provider offers this option.
                </AlertDescription>
              </Alert>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <p>
                Exchange rates are indicative and based on current market rates. 
                Actual rates may vary at time of payment depending on your bank or card provider.
                Currency preference is passed as metadata and does not guarantee processing in that currency.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default FxSmartSaveCheckout;
