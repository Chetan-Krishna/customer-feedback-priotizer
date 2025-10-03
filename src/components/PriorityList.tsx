import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface PriorityListProps {
  items: FeedbackItem[];
}

const PriorityList = ({ items }: PriorityListProps) => {
  const { toast } = useToast();

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 8) return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
    if (urgency >= 5) return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300";
    return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "😊";
      case "negative": return "😞";
      default: return "😐";
    }
  };

  const handleExport = () => {
    const csv = [
      ["Title", "Category", "Urgency", "Impact", "Priority Score", "Sentiment", "Summary"],
      ...items.map(item => [
        item.title,
        item.category,
        item.urgency,
        item.impact,
        item.priorityScore,
        item.sentiment,
        item.summary
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback-priority-list.csv";
    a.click();

    toast({
      title: "Exported successfully",
      description: "Priority list downloaded as CSV",
    });
  };

  const handleEmailReport = () => {
    toast({
      title: "Email report feature",
      description: "Connect your email service to enable weekly reports via Notion/Slack/Email",
    });
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Prioritized Action List</h3>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEmailReport}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <Card 
            key={item.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {index + 1}
                </div>
              </div>

              <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <h4 className="font-semibold text-base mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                  </div>
                  
                  <span className="text-2xl" title={item.sentiment}>
                    {getSentimentIcon(item.sentiment)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{item.category}</Badge>
                  <Badge className={getUrgencyColor(item.urgency)}>
                    Urgency: {item.urgency}/10
                  </Badge>
                  <Badge variant="outline">
                    Impact: {item.impact}/10
                  </Badge>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    Priority: {item.priorityScore}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default PriorityList;
