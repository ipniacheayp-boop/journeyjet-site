import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Shield } from "lucide-react";

interface PriceSummaryCardProps {
  basePrice: number;
  taxes: number;
  discount: number;
  currency: string;
  passengerCount: number;
  couponCode: string | null;
}

const PriceSummaryCard = ({ basePrice, taxes, discount, currency, passengerCount, couponCode }: PriceSummaryCardProps) => {
  const subtotal = basePrice * passengerCount;
  const totalTaxes = taxes * passengerCount;
  const total = subtotal + totalTaxes - discount;

  return (
    <Card className="bg-card border-border sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Base Fare {passengerCount > 1 && `× ${passengerCount}`}
          </span>
          <span className="text-foreground">{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxes & Fees</span>
          <span className="text-foreground">{formatCurrency(totalTaxes, currency)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount {couponCode && `(${couponCode})`}</span>
            <span>-{formatCurrency(discount, currency)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span className="text-foreground">Total</span>
          <span className="text-primary">{formatCurrency(total, currency)}</span>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-0.5">Secure Booking Guarantee</p>
            <p>Your payment information is encrypted and secure. Free cancellation available within 24 hours.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceSummaryCard;
