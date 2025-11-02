import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Ban, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AgentManagement = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [commissionRate, setCommissionRate] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_profiles')
        .select(`
          *,
          agent_wallet(balance),
          agent_commissions(commission_amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
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

  const handleActivate = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agent_profiles')
        .update({ status: 'active' })
        .eq('id', agentId);

      if (error) throw error;
      
      toast({ title: 'Agent activated successfully' });
      fetchAgents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSuspend = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agent_profiles')
        .update({ status: 'suspended' })
        .eq('id', agentId);

      if (error) throw error;
      
      toast({ title: 'Agent suspended' });
      fetchAgents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCommission = async () => {
    if (!selectedAgent) return;
    
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: 'Invalid rate',
        description: 'Commission rate must be between 0 and 100',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('agent_profiles')
        .update({ commission_rate: rate })
        .eq('id', selectedAgent.id);

      if (error) throw error;
      
      toast({ title: 'Commission rate updated' });
      setSelectedAgent(null);
      fetchAgents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'suspended') {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Agent Code</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No agents found
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                      {agent.company_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{agent.contact_person}</div>
                        <div className="text-muted-foreground">{agent.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {agent.agent_code}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setCommissionRate(agent.commission_rate.toString());
                            }}
                          >
                            {agent.commission_rate}%
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Commission Rate</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="commission">Commission Rate (%)</Label>
                              <Input
                                id="commission"
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                              />
                            </div>
                            <Button onClick={handleUpdateCommission} className="w-full">
                              Update Rate
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      ${Number(agent.agent_wallet?.[0]?.balance || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(agent.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {agent.status === 'suspended' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(agent.id)}
                            title="Activate agent"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspend(agent.id)}
                            title="Suspend agent"
                          >
                            <Ban className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentManagement;
