import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Check, X, Percent } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  code: string;
  label: string;
  type: "fixed" | "percent";
  value: number;
  minOrder: number;
}

const availableCoupons: Coupon[] = [
  { code: "TRIP50", label: "$50 OFF on orders above $500", type: "fixed", value: 50, minOrder: 500 },
  { code: "NEWUSER", label: "10% OFF for new users", type: "percent", value: 10, minOrder: 0 },
  { code: "SAVE20", label: "$20 OFF on any booking", type: "fixed", value: 20, minOrder: 0 },
];

interface CouponSectionProps {
  totalPrice: number;
  appliedCoupon: string | null;
  discount: number;
  onApplyCoupon: (code: string, discount: number) => void;
  onRemoveCoupon: () => void;
  disabled?: boolean;
}

const CouponSection = ({ totalPrice, appliedCoupon, discount, onApplyCoupon, onRemoveCoupon, disabled }: CouponSectionProps) => {
  const [couponInput, setCouponInput] = useState("");

  const validateAndApply = (code: string) => {
    const coupon = availableCoupons.find((c) => c.code === code.toUpperCase().trim());
    if (!coupon) {
      toast.error("Invalid coupon code");
      return;
    }
    if (totalPrice < coupon.minOrder) {
      toast.error(`Minimum order of $${coupon.minOrder} required for ${coupon.code}`);
      return;
    }
    const disc = coupon.type === "fixed" ? coupon.value : (totalPrice * coupon.value) / 100;
    onApplyCoupon(coupon.code, disc);
    setCouponInput("");
    toast.success(`Coupon ${coupon.code} applied! You save $${disc.toFixed(2)}`);
  };

  // Auto-suggest best coupon
  const bestCoupon = availableCoupons
    .filter((c) => totalPrice >= c.minOrder && c.code !== appliedCoupon)
    .sort((a, b) => {
      const discA = a.type === "fixed" ? a.value : (totalPrice * a.value) / 100;
      const discB = b.type === "fixed" ? b.value : (totalPrice * b.value) / 100;
      return discB - discA;
    })[0];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Coupons & Discounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available coupons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Available Coupons</p>
          <div className="grid gap-2">
            {availableCoupons.map((coupon) => {
              const isApplied = appliedCoupon === coupon.code;
              const isEligible = totalPrice >= coupon.minOrder;
              return (
                <div
                  key={coupon.code}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isApplied
                      ? "border-primary bg-primary/5"
                      : isEligible
                        ? "border-border hover:border-primary/50 cursor-pointer"
                        : "border-border opacity-50"
                  }`}
                  onClick={() => !isApplied && isEligible && !disabled && validateAndApply(coupon.code)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <Percent className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-sm text-foreground">{coupon.code}</p>
                      <p className="text-xs text-muted-foreground">{coupon.label}</p>
                    </div>
                  </div>
                  {isApplied ? (
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <Check className="w-3 h-3" /> Applied
                    </Badge>
                  ) : !isEligible ? (
                    <Badge variant="outline" className="text-xs">Min ${coupon.minOrder}</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-primary text-xs" disabled={disabled}>
                      Apply
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            disabled={disabled || !!appliedCoupon}
            className="font-mono"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => validateAndApply(couponInput)}
            disabled={disabled || !couponInput || !!appliedCoupon}
          >
            Apply
          </Button>
        </div>

        {/* Applied coupon */}
        {appliedCoupon && (
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                <span className="font-mono">{appliedCoupon}</span> — saving ${discount.toFixed(2)}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { onRemoveCoupon(); toast.info("Coupon removed"); }}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Best coupon suggestion */}
        {!appliedCoupon && bestCoupon && (
          <p className="text-xs text-primary">
            💡 Best deal: Apply <span className="font-mono font-semibold">{bestCoupon.code}</span> to save up to $
            {(bestCoupon.type === "fixed" ? bestCoupon.value : (totalPrice * bestCoupon.value) / 100).toFixed(2)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponSection;
