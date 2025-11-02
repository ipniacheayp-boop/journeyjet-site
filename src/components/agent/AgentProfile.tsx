import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Phone, FileText, Save } from 'lucide-react';

interface AgentProfileProps {
  agentId: string;
}

interface ProfileData {
  company_name: string;
  contact_person: string;
  phone: string;
  gst_number: string;
  agent_code: string;
  commission_rate: number;
}

const AgentProfile = ({ agentId }: AgentProfileProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    company_name: '',
    contact_person: '',
    phone: '',
    gst_number: '',
    agent_code: '',
    commission_rate: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [agentId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          company_name: data.company_name || '',
          contact_person: data.contact_person || '',
          phone: data.phone || '',
          gst_number: data.gst_number || '',
          agent_code: data.agent_code || '',
          commission_rate: data.commission_rate || 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const { error } = await supabase.functions.invoke('agent-profile-update', {
        body: {
          companyName: profile.company_name,
          contactPerson: profile.contact_person,
          phone: profile.phone,
          gstNumber: profile.gst_number,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Profile</CardTitle>
        <CardDescription>
          Update your profile information and business details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company_name"
                  className="pl-9"
                  value={profile.company_name}
                  onChange={(e) =>
                    setProfile({ ...profile, company_name: e.target.value })
                  }
                  placeholder="Your Company Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact_person"
                  className="pl-9"
                  value={profile.contact_person}
                  onChange={(e) =>
                    setProfile({ ...profile, contact_person: e.target.value })
                  }
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-9"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst_number">GST Number</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="gst_number"
                  className="pl-9"
                  value={profile.gst_number}
                  onChange={(e) =>
                    setProfile({ ...profile, gst_number: e.target.value })
                  }
                  placeholder="GST Number"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Agent Code</Label>
              <Input value={profile.agent_code} disabled />
            </div>

            <div className="space-y-2">
              <Label>Commission Rate</Label>
              <Input value={`${profile.commission_rate}%`} disabled />
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AgentProfile;
