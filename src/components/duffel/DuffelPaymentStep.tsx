import { useEffect, useState } from "react";
import { DuffelCardForm, useDuffelCardFormActions, createThreeDSecureSession } from "@duffel/components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { getDuffelClientKey } from "@/services/duffelBooking";

interface Props {
  offerId: string;
  amountLabel: string;
  /** Called with the authenticated 3DS session id (preferred) or the temporary card id. */
  onAuthorised: (result: { threeDSecureSessionId?: string; cardId?: string }) => void;
  submitting: boolean;
  externalError?: string | null;
}

type Phase = "loading" | "ready" | "tokenising" | "authenticating" | "error";

const DuffelPaymentStep = ({ offerId, amountLabel, onAuthorised, submitting, externalError }: Props) => {
  const [clientKey, setClientKey] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [cardValid, setCardValid] = useState(false);

  const { ref, createCardForTemporaryUse } = useDuffelCardFormActions();

  useEffect(() => {
    let active = true;
    (async () => {
      const { clientKey: key, error: keyError } = await getDuffelClientKey();
      if (!active) return;
      if (!key) {
        setError(keyError ?? "Card payments are temporarily unavailable.");
        setPhase("error");
        return;
      }
      setClientKey(key);
      setPhase("ready");
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = () => {
    setError(null);
    setPhase("tokenising");
    createCardForTemporaryUse();
  };

  const busy = submitting || phase === "tokenising" || phase === "authenticating";

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="w-4 h-4" aria-hidden="true" />
          Secure card payment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Card details are entered directly into our payment provider&apos;s PCI-compliant form and never touch
          Tripile&apos;s servers.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {(error || externalError) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error || externalError}</AlertDescription>
          </Alert>
        )}

        {phase === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Preparing secure payment form…
          </div>
        )}

        {clientKey && (
          <div className="rounded-2xl border border-border bg-background p-4">
            <DuffelCardForm
              ref={ref}
              clientKey={clientKey}
              intent="to-create-card-for-temporary-use"
              onValidateSuccess={() => setCardValid(true)}
              onValidateFailure={() => setCardValid(false)}
              onCreateCardForTemporaryUseSuccess={async (card) => {
                try {
                  setPhase("authenticating");
                  // 3D Secure / SCA — the component opens the bank challenge when required.
                  const session = await createThreeDSecureSession(clientKey, card.id, offerId, [], true);

                  if (session.status === "ready_for_payment") {
                    onAuthorised({ threeDSecureSessionId: session.id });
                    return;
                  }

                  setPhase("ready");
                  setError(
                    session.status === "expired"
                      ? "The payment authentication expired. Please submit your card details again."
                      : "Your bank did not authorise this payment. Please try again or use a different card.",
                  );
                } catch {
                  setPhase("ready");
                  setError("We couldn't verify your card with your bank. Please try again or use a different card.");
                }
              }}
              onCreateCardForTemporaryUseFailure={() => {
                setPhase("ready");
                setError("We couldn't read those card details. Please check them and try again.");
              }}
              onSecurityPolicyViolation={() => {
                setPhase("error");
                setError("Your browser blocked the secure payment form. Please disable blocking extensions and reload.");
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
          3D Secure protected. Your card is charged only when the airline confirms your seats.
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={busy || phase !== "ready" || !cardValid}
          onClick={handleSubmit}
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              {phase === "authenticating" ? "Verifying with your bank…" : "Processing payment…"}
            </>
          ) : (
            `Pay ${amountLabel} & confirm booking`
          )}
        </Button>

        {!cardValid && phase === "ready" && (
          <p className="text-xs text-muted-foreground text-center">
            Complete all card fields to enable payment.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DuffelPaymentStep;
