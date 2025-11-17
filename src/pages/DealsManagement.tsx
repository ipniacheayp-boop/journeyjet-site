import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import type { Deal } from '@/hooks/useDeals';

const DealsManagement = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    origin_city: '',
    origin_code: '',
    dest_city: '',
    dest_code: '',
    airline: '',
    airline_code: '',
    class: 'Economy',
    date_from: '',
    date_to: '',
    price_usd: 0,
    original_price_usd: 0,
    short_description: '',
    description: '',
    tags: [] as string[],
    featured: false,
    published: true,
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDeals();
    }
  }, [isAdmin]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDeals = async () => {
    try {
      toast.info('Generating demo deals...');
      const { data, error } = await supabase.functions.invoke('deals-seed', {
        body: { count: 50 },
      });

      if (error) throw error;
      toast.success('Demo deals generated successfully!');
      fetchDeals();
    } catch (error: any) {
      console.error('Error seeding deals:', error);
      toast.error('Failed to generate demo deals');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDeal) {
        const { error } = await supabase
          .from('deals')
          .update(formData)
          .eq('id', editingDeal.id);

        if (error) throw error;
        toast.success('Deal updated successfully!');
      } else {
        const { error } = await supabase
          .from('deals')
          .insert([formData]);

        if (error) throw error;
        toast.success('Deal created successfully!');
      }

      setShowForm(false);
      setEditingDeal(null);
      resetForm();
      fetchDeals();
    } catch (error: any) {
      console.error('Error saving deal:', error);
      toast.error(error.message || 'Failed to save deal');
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;
      toast.success('Deal deleted successfully!');
      fetchDeals();
    } catch (error: any) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      slug: deal.slug,
      origin_city: deal.origin_city,
      origin_code: deal.origin_code,
      dest_city: deal.dest_city,
      dest_code: deal.dest_code,
      airline: deal.airline,
      airline_code: deal.airline_code || '',
      class: deal.class,
      date_from: deal.date_from,
      date_to: deal.date_to,
      price_usd: deal.price_usd,
      original_price_usd: deal.original_price_usd,
      short_description: deal.short_description || '',
      description: deal.description || '',
      tags: deal.tags || [],
      featured: deal.featured,
      published: deal.published,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      origin_city: '',
      origin_code: '',
      dest_city: '',
      dest_code: '',
      airline: '',
      airline_code: '',
      class: 'Economy',
      date_from: '',
      date_to: '',
      price_usd: 0,
      original_price_usd: 0,
      short_description: '',
      description: '',
      tags: [],
      featured: false,
      published: true,
    });
  };

  if (adminLoading || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deals Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleSeedDeals} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Demo Deals
          </Button>
          <Button onClick={() => {
            setShowForm(true);
            setEditingDeal(null);
            resetForm();
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Deal
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingDeal ? 'Edit Deal' : 'Create New Deal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL-friendly)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="origin_city">Origin City</Label>
                  <Input
                    id="origin_city"
                    value={formData.origin_city}
                    onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="origin_code">Origin Code</Label>
                  <Input
                    id="origin_code"
                    value={formData.origin_code}
                    onChange={(e) => setFormData({ ...formData, origin_code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dest_city">Destination City</Label>
                  <Input
                    id="dest_city"
                    value={formData.dest_city}
                    onChange={(e) => setFormData({ ...formData, dest_city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dest_code">Destination Code</Label>
                  <Input
                    id="dest_code"
                    value={formData.dest_code}
                    onChange={(e) => setFormData({ ...formData, dest_code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="airline">Airline</Label>
                  <Input
                    id="airline"
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_from">Date From</Label>
                  <Input
                    id="date_from"
                    type="date"
                    value={formData.date_from}
                    onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_to">Date To</Label>
                  <Input
                    id="date_to"
                    type="date"
                    value={formData.date_to}
                    onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price_usd">Price (USD)</Label>
                  <Input
                    id="price_usd"
                    type="number"
                    value={formData.price_usd}
                    onChange={(e) => setFormData({ ...formData, price_usd: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="original_price_usd">Original Price (USD)</Label>
                  <Input
                    id="original_price_usd"
                    type="number"
                    value={formData.original_price_usd}
                    onChange={(e) => setFormData({ ...formData, original_price_usd: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingDeal ? 'Update Deal' : 'Create Deal'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDeal(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {deals.map((deal) => (
          <Card key={deal.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">{deal.title}</h3>
                  {deal.featured && <Badge variant="default">Featured</Badge>}
                  {!deal.published && <Badge variant="secondary">Draft</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {deal.origin_code} → {deal.dest_code} | {deal.airline} | ${deal.price_usd}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Views: {deal.views_count || 0} | Clicks: {deal.clicks_count || 0}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/deals/${deal.slug}`, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(deal)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(deal.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {deals.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No deals found. Create your first deal!</p>
          <Button onClick={handleSeedDeals}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Demo Deals
          </Button>
        </div>
      )}
    </div>
  );
};

export default DealsManagement;