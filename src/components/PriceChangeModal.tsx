import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PriceChangeModalProps {
  open: boolean;
  originalPrice: number;
  newPrice: number;
  currency: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PriceChangeModal = ({
  open,
  originalPrice,
  newPrice,
  currency,
  onConfirm,
  onCancel,
}: PriceChangeModalProps) => {
  const priceDiff = newPrice - originalPrice;
  const isIncrease = priceDiff > 0;
  const percentChange = ((priceDiff / originalPrice) * 100).toFixed(1);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Price Has Changed
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              The price for this booking has {isIncrease ? 'increased' : 'decreased'} since you started.
            </p>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Price:</span>
                <span className="line-through text-muted-foreground">
                  {formatCurrency(originalPrice, currency)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>New Price:</span>
                <span className={isIncrease ? 'text-destructive' : 'text-green-600'}>
                  {formatCurrency(newPrice, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span>Difference:</span>
                <span className={isIncrease ? 'text-destructive' : 'text-green-600'}>
                  {isIncrease ? '+' : ''}{formatCurrency(priceDiff, currency)} ({isIncrease ? '+' : ''}{percentChange}%)
                </span>
              </div>
            </div>

            <p className="text-sm">
              Would you like to continue with the new price?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel Booking
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Continue with New Price
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PriceChangeModal;
