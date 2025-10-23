import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HealthCheck {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

interface HealthReport {
  timestamp: string;
  checks: HealthCheck[];
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
}

export const StripeHealthCheck = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-health-check');
      
      if (error) throw error;
      
      setReport(data);
      
      toast({
        title: 'Health Check Complete',
        description: `System status: ${data.overall_status}`,
        variant: data.overall_status === 'healthy' ? 'default' : 'destructive',
      });
    } catch (error: any) {
      console.error('Error running health check:', error);
      toast({
        title: 'Error',
        description: 'Failed to run health check',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case 'unhealthy':
        return <Badge className="bg-red-500">Unhealthy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stripe Health Check</CardTitle>
            <CardDescription>
              Run diagnostics on Stripe integration
            </CardDescription>
          </div>
          <Button onClick={runHealthCheck} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Check
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {report && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Overall Status</p>
                <p className="text-2xl font-bold">{getStatusBadge(report.overall_status)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="text-sm font-medium">
                  {new Date(report.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {report.checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <p className="font-medium">{check.name}</p>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                  </div>
                  <Badge
                    variant={
                      check.status === 'ok'
                        ? 'default'
                        : check.status === 'warning'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {check.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {!report && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Check" to start diagnostics
          </div>
        )}
      </CardContent>
    </Card>
  );
};
