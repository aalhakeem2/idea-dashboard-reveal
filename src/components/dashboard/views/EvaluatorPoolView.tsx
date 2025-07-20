
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const EvaluatorPoolView = () => {
  const { language } = useLanguage();
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluators();
  }, []);

  const fetchEvaluators = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'evaluator')
        .eq('is_active', true);

      if (error) throw error;
      setEvaluators(data || []);
    } catch (error) {
      console.error('Error fetching evaluators:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'مجموعة المقيمين' : 'Evaluator Pool'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'عرض جميع المقيمين المتاحين' : 'View all available evaluators'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evaluators.map((evaluator) => (
            <Card key={evaluator.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {evaluator.full_name || evaluator.email}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {language === 'ar' ? 'التخصصات:' : 'Specializations:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {evaluator.specialization?.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      )) || (
                        <Badge variant="outline" className="text-xs">
                          {language === 'ar' ? 'غير محدد' : 'Not specified'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4" />
                    {language === 'ar' ? 'نشط منذ:' : 'Active since:'} {' '}
                    {new Date(evaluator.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
