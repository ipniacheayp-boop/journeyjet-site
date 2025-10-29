import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import SearchWidget from '@/components/SearchWidget';

interface AgentBookingWidgetProps {
  agentId: string;
  commissionRate: number;
}

const AgentBookingWidget = ({ agentId, commissionRate }: AgentBookingWidgetProps) => {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          All bookings made through this panel will include your {commissionRate}% commission.
          Prices shown are B2B rates.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Book for Your Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flights">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flights">Flights</TabsTrigger>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
              <TabsTrigger value="cars">Cars</TabsTrigger>
            </TabsList>
            
            <TabsContent value="flights">
              <SearchWidget defaultTab="flights" isAgentBooking={true} agentId={agentId} />
            </TabsContent>
            
            <TabsContent value="hotels">
              <SearchWidget defaultTab="hotels" isAgentBooking={true} agentId={agentId} />
            </TabsContent>
            
            <TabsContent value="cars">
              <SearchWidget defaultTab="cars" isAgentBooking={true} agentId={agentId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentBookingWidget;
