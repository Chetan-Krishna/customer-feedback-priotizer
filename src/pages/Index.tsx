import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, TrendingUp, AlertCircle, BarChart3, Bell } from "lucide-react";
import FeedbackMatrix from "@/components/FeedbackMatrix";
import PriorityList from "@/components/PriorityList";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import NotificationSettings from "@/components/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedbackItem {
  id: string;
  title: string;
  category: string;
  urgency: number;
  impact: number;
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
  priorityScore: number;
}

const Index = () => {
  const [feedbackText, setFeedbackText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<FeedbackItem[]>([]);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "No feedback provided",
        description: "Please enter some customer feedback to analyze.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-feedback', {
        body: { feedbackText }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setResults(data.items || []);
      
      toast({
        title: "Analysis complete!",
        description: `Categorized ${data.items?.length || 0} feedback items.`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Feedback Analysis
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Customer Feedback Prioritizer
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform thousands of feedback entries into actionable insights. 
              Our AI categorizes by urgency and impact, so you know exactly what to build next.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="max-w-4xl mx-auto p-6 shadow-elevated">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Paste Your Feedback</h2>
            </div>
            
            <Textarea
              placeholder="Paste customer feedback here... You can include multiple feedback entries from surveys, support tickets, social media, etc."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Supports feedback from surveys, in-app feedback, social media, and more
              </p>
              
              <Button 
                onClick={handleAnalyze}
                disabled={analyzing || !feedbackText.trim()}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Results & Analytics Section */}
      <div className="container mx-auto px-4 pb-16 space-y-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue={results.length > 0 ? "current" : "analytics"} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">
                <AlertCircle className="h-4 w-4 mr-2" />
                Current Analysis
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-6 mt-6">
              {results.length > 0 ? (
                <>
                  <FeedbackMatrix items={results} />
                  <PriorityList items={results} />
                </>
              ) : (
                <Card className="p-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No current analysis. Analyze feedback to see results here.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </div>
  );
};

export default Index;
