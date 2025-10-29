import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Plus, ArrowDownToLine, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AgentWalletViewProps {
  agentId: string;
}

const AgentWalletView = ({ agentId }: AgentWalletViewProps) => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, [agentId]);

  const fetchWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('agent-wallet-balance');
      
      if (error) throw error;
      
      setBalance(data.wallet.balance);
      setTransactions(data.transactions);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setTopupLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('agent-wallet-topup', {
        body: { amount, currency: 'USD' },
      });

      if (error) throw error;

      // Open Stripe checkout
      window.open(data.url, '_blank');
      toast({
        title: 'Redirecting to payment',
        description: 'Complete your payment to add funds',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-6">${Number(balance).toFixed(2)}</div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="topup-amount">Add Funds</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="topup-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
                <Button onClick={handleTopup} disabled={topupLoading}>
                  {topupLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Funds
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>
                        {new Date(txn.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={txn.type === 'credit' ? 'default' : 'secondary'}>
                          {txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{txn.description || '-'}</TableCell>
                      <TableCell className={`text-right font-semibold ${
                        txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}${Math.abs(Number(txn.amount)).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(txn.balance_after).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentWalletView;
