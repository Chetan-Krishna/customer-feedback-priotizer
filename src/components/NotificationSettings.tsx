import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, MessageSquare, Save } from "lucide-react";

const NotificationSettings = () => {
  const [email, setEmail] = useState("");
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [criticalThreshold, setCriticalThreshold] = useState(14);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettingsId(data.id);
        setEmail(data.email);
        setWeeklyReports(data.enable_weekly_reports);
        setCriticalAlerts(data.enable_critical_alerts);
        setCriticalThreshold(data.critical_threshold);
        setSlackWebhook(data.slack_webhook_url || "");
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const settingsData = {
        email,
        enable_weekly_reports: weeklyReports,
        enable_critical_alerts: criticalAlerts,
        critical_threshold: criticalThreshold,
        slack_webhook_url: slackWebhook || null,
      };

      let result;
      if (settingsId) {
        result = await supabase
          .from('notification_settings')
          .update(settingsData)
          .eq('id', settingsId);
      } else {
        result = await supabase
          .from('notification_settings')
          .insert(settingsData)
          .select()
          .single();
        
        if (result.data) {
          setSettingsId(result.data.id);
        }
      }

      if (result.error) throw result.error;

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Notification Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            We'll send notifications to this email
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label htmlFor="weekly">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Get a weekly summary of all feedback
              </p>
            </div>
          </div>
          <Switch
            id="weekly"
            checked={weeklyReports}
            onCheckedChange={setWeeklyReports}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label htmlFor="critical">Critical Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get instant alerts for high-priority feedback
              </p>
            </div>
          </div>
          <Switch
            id="critical"
            checked={criticalAlerts}
            onCheckedChange={setCriticalAlerts}
          />
        </div>

        {criticalAlerts && (
          <div>
            <Label htmlFor="threshold">Critical Priority Threshold</Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              max="20"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Alert when priority score is {criticalThreshold} or higher
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="slack">Slack Webhook URL (Optional)</Label>
          <div className="flex items-center gap-2 mt-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Input
              id="slack"
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Get alerts in your Slack channel
          </p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </Card>
  );
};

export default NotificationSettings;
