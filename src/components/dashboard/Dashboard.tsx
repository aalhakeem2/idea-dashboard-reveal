import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import Sidebar from "./Sidebar";
import { Header } from "./Header";
import { SubmitterDashboard } from "./SubmitterDashboard";
import { EvaluatorDashboard } from "./EvaluatorDashboard";
import { ManagementDashboard } from "./ManagementDashboard";
import { EnhancedSubmitterDashboard } from "./EnhancedSubmitterDashboard";
import { EnhancedEvaluatorDashboard } from "./EnhancedEvaluatorDashboard";
import { EnhancedManagementDashboard } from "./EnhancedManagementDashboard";
import { ProfileSetup } from "./ProfileSetup";
import { useToast } from "@/hooks/use-toast";
import { seedSampleData, forceSeedSampleData } from "@/utils/sampleDataSeeder";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Profile = Tables<"profiles">;

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [ideas, setIdeas] = useState<any[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  useEffect(() => {
    if (profile) {
      fetchIdeas();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile(data);

      // Automatically seed sample data when profile is loaded
      if (data && data.role) {
        console.log("Profile loaded, attempting to seed sample data...");
        setTimeout(() => {
          seedSampleData();
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const handleForceSeed = async () => {
    setSeeding(true);
    try {
      await forceSeedSampleData();
      toast({
        title: "Success",
        description: "Sample data has been seeded successfully!",
      });
      // Refresh ideas after seeding
      fetchIdeas();
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({
        title: "Error",
        description: "Failed to seed sample data",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || !profile.role) {
    return <ProfileSetup user={user} onProfileUpdate={handleProfileUpdate} />;
  }

  const renderDashboard = () => {
    console.log("Dashboard: Rendering for profile role:", profile.role, "Active view:", activeView);
    
    switch (profile.role) {
      case "submitter":
        return <EnhancedSubmitterDashboard profile={profile} activeView={activeView} />;
      case "evaluator":
        return <EnhancedEvaluatorDashboard profile={profile} activeView={activeView} />;
      case "management":
        // Pass activeView to Enhanced Management Dashboard
        return <EnhancedManagementDashboard ideas={ideas} onIdeaUpdated={fetchIdeas} activeView={activeView} profile={profile} />;
      default:
        return <EnhancedSubmitterDashboard profile={profile} activeView={activeView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        role={profile.role} 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />
      <div className="flex-1 flex flex-col">
        <Header profile={profile} />
        <main className="flex-1 p-6">
          {/* Enhanced Controls */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {profile.role === "management" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Enhanced Management Dashboard</span>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleForceSeed}
              disabled={seeding}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {seeding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>{seeding ? t('dashboard', 'seeding') : t('dashboard', 'seed_sample_data')}</span>
            </Button>
          </div>
          
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
};
