import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AgentWallet = () => {
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('agent-wallet-balance');

      if (error) throw error;

      setWalletData(data);
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load wallet data",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setTopupLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('agent-wallet-topup', {
        body: { amount, currency: walletData?.wallet?.currency || 'USD' },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error initiating top-up:', error);
      toast({
        title: "Top-up Failed",
        description: error.message || "Failed to initiate wallet top-up",
        variant: "destructive",
      });
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const wallet = walletData?.wallet || {};
  const transactions = walletData?.transactions || [];
  const commissions = walletData?.commissions || [];
  const agent = walletData?.agent || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Agent Wallet</h1>
            <p className="text-muted-foreground">
              Agent Code: <span className="font-semibold text-primary">{agent.agent_code}</span> | 
              Commission Rate: <span className="font-semibold text-primary">{agent.commission_rate}%</span>
            </p>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary mb-6">
                {wallet.currency || 'USD'} {parseFloat(wallet.balance || 0).toFixed(2)}
              </div>
              
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="flex-1"
                  min="0"
                  step="0.01"
                />
                <Button onClick={handleTopup} disabled={topupLoading} size="lg">
                  {topupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Top Up Wallet
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Last 10 wallet activities</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {tx.type === 'topup' ? (
                            <ArrowUpRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-orange-500" />
                          )}
                          <div>
                            <p className="font-medium capitalize">{tx.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${tx.type === 'topup' ? 'text-green-600' : 'text-orange-600'}`}>
                            {tx.type === 'topup' ? '+' : '-'}{tx.currency} {parseFloat(tx.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Bal: {tx.currency} {parseFloat(tx.balance_after || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Commission Earnings
                </CardTitle>
                <CardDescription>Recent booking commissions</CardDescription>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No commissions yet</p>
                ) : (
                  <div className="space-y-3">
                    {commissions.slice(0, 10).map((comm: any) => (
                      <div key={comm.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{comm.bookings?.booking_type || 'Booking'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(comm.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {comm.currency} {parseFloat(comm.commission_amount).toFixed(2)}
                          </p>
                          <Badge variant={comm.payout_status === 'paid' ? 'default' : 'secondary'}>
                            {comm.payout_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentWallet;