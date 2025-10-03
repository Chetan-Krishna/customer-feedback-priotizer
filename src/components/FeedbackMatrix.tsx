import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface FeedbackMatrixProps {
  items: FeedbackItem[];
}

const FeedbackMatrix = ({ items }: FeedbackMatrixProps) => {
  const getQuadrant = (item: FeedbackItem) => {
    const highUrgency = item.urgency >= 6;
    const highImpact = item.impact >= 6;
    
    if (highUrgency && highImpact) return "critical";
    if (highUrgency && !highImpact) return "urgent";
    if (!highUrgency && highImpact) return "important";
    return "low";
  };

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "critical": return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900";
      case "urgent": return "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900";
      case "important": return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900";
      default: return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900";
    }
  };

  const getQuadrantLabel = (quadrant: string) => {
    switch (quadrant) {
      case "critical": return "Critical";
      case "urgent": return "Urgent";
      case "important": return "Important";
      default: return "Low Priority";
    }
  };

  const quadrants = {
    critical: items.filter(item => getQuadrant(item) === "critical"),
    urgent: items.filter(item => getQuadrant(item) === "urgent"),
    important: items.filter(item => getQuadrant(item) === "important"),
    low: items.filter(item => getQuadrant(item) === "low"),
  };

  return (
    <Card className="p-6 mb-8 shadow-card">
      <h3 className="text-lg font-semibold mb-4">Urgency/Impact Matrix</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(quadrants).map(([key, items]) => (
          <Card 
            key={key}
            className={`p-4 border-2 ${getQuadrantColor(key)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{getQuadrantLabel(key)}</h4>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {items.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  className="text-sm p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <p className="font-medium line-clamp-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.category} • Score: {item.priorityScore}
                  </p>
                </div>
              ))}
              
              {items.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{items.length - 3} more items
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default FeedbackMatrix;
