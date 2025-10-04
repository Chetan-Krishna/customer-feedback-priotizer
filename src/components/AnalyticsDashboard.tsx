import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";

interface FeedbackItem {
  id: string;
  title: string;
  category: string;
  urgency: number;
  impact: number;
  sentiment: "positive" | "neutral" | "negative";
  priority_score: number;
  created_at: string;
}

const AnalyticsDashboard = () => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      // Cast the data to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        sentiment: item.sentiment as "positive" | "neutral" | "negative"
      }));
      setItems(typedData);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Failed to load analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Category Distribution
  const categoryData = items.reduce((acc, item) => {
    const existing = acc.find(c => c.name === item.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Sentiment Distribution
  const sentimentData = items.reduce((acc, item) => {
    const existing = acc.find(s => s.name === item.sentiment);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.sentiment, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Priority over time (last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const trendData = last7Days.map(day => {
    const dayItems = items.filter(item => item.created_at.startsWith(day));
    const avgPriority = dayItems.length > 0
      ? dayItems.reduce((sum, item) => sum + item.priority_score, 0) / dayItems.length
      : 0;
    return {
      date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgPriority: Math.round(avgPriority * 10) / 10,
      count: dayItems.length
    };
  });

  const COLORS = ['#8B5CF6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Loading analytics...</p>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No feedback data yet. Analyze some feedback to see insights!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            <Activity className="h-4 w-4 mr-2" />
            Sentiment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Priority Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" label={{ value: 'Avg Priority', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Count', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgPriority" stroke="#8B5CF6" name="Avg Priority Score" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#06b6d4" name="Feedback Count" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Feedback by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => {
                    const color = entry.name === 'positive' ? '#10b981' : entry.name === 'negative' ? '#ef4444' : '#f59e0b';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
