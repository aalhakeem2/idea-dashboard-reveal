import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type IdeaCategory = Database["public"]["Enums"]["idea_category"];
type IdeaStatus = Database["public"]["Enums"]["idea_status"];

export const seedSampleData = async () => {
  try {
    // Check if sample data already exists
    const { data: existingIdeas } = await supabase
      .from("ideas")
      .select("id")
      .limit(1);

    if (existingIdeas && existingIdeas.length > 0) {
      console.log("Sample data already exists");
      return;
    }

    console.log("Seeding sample data...");

    // Ensure test user profiles exist first
    const testUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'submitter@you.com',
        full_name: 'Hani Gazim',
        role: 'submitter' as const,
        department: 'Operations',
        email_confirmed: true
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'evaluator@you.com',
        full_name: 'Abdurhman Alhakeem',
        role: 'evaluator' as const,
        department: 'R&D',
        email_confirmed: true
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'management@you.com',
        full_name: 'Osama Murshed',
        role: 'management' as const,
        department: 'Executive',
        email_confirmed: true
      }
    ];

    // Create test user profiles if they don't exist
    for (const user of testUsers) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert(user);
        
        if (profileError) {
          console.error("Error creating test profile:", profileError);
        }
      }
    }

    // Add sample ideas with proper typing
    const sampleIdeas = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'AI-Powered Customer Service Chatbot',
        description: 'Implement an AI chatbot to handle 80% of customer inquiries automatically, reducing response time and improving customer satisfaction while lowering operational costs.',
        category: 'technology' as IdeaCategory,
        status: 'submitted' as IdeaStatus,
        submitter_id: '11111111-1111-1111-1111-111111111111',
        strategic_alignment_score: 9,
        implementation_cost: 50000.00,
        expected_roi: 200.00
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        title: 'Green Energy Initiative',
        description: 'Transform our facilities to use 100% renewable energy sources, reducing carbon footprint by 60% and energy costs by 30% over 5 years.',
        category: 'sustainability' as IdeaCategory,
        status: 'under_review' as IdeaStatus,
        submitter_id: '11111111-1111-1111-1111-111111111111',
        strategic_alignment_score: 8,
        implementation_cost: 250000.00,
        expected_roi: 150.00,
        assigned_evaluator_id: '22222222-2222-2222-2222-222222222222'
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        title: 'Remote Work Productivity Suite',
        description: 'Develop a comprehensive digital workspace that increases remote work efficiency by 40% through integrated collaboration tools.',
        category: 'process_improvement' as IdeaCategory,
        status: 'approved' as IdeaStatus,
        submitter_id: '11111111-1111-1111-1111-111111111111',
        strategic_alignment_score: 7,
        implementation_cost: 75000.00,
        expected_roi: 300.00,
        assigned_evaluator_id: '22222222-2222-2222-2222-222222222222'
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        title: 'Customer Loyalty Rewards Program',
        description: 'Create a gamified loyalty program to increase customer retention by 25% and average order value by 15%.',
        category: 'customer_experience' as IdeaCategory,
        status: 'implemented' as IdeaStatus,
        submitter_id: '11111111-1111-1111-1111-111111111111',
        strategic_alignment_score: 8,
        implementation_cost: 30000.00,
        expected_roi: 400.00,
        assigned_evaluator_id: '33333333-3333-3333-3333-333333333333'
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        title: 'Automated Inventory Management',
        description: 'Implement IoT sensors and AI to optimize inventory levels, reducing waste by 20% and improving stock availability.',
        category: 'innovation' as IdeaCategory,
        status: 'rejected' as IdeaStatus,
        submitter_id: '11111111-1111-1111-1111-111111111111',
        strategic_alignment_score: 6,
        implementation_cost: 100000.00,
        expected_roi: 180.00,
        assigned_evaluator_id: '22222222-2222-2222-2222-222222222222'
      }
    ];

    const { error: ideasError } = await supabase
      .from("ideas")
      .insert(sampleIdeas);

    if (ideasError) {
      console.error("Error inserting sample ideas:", ideasError);
      return;
    }

    // Add sample evaluations
    const sampleEvaluations = [
      {
        id: 'eval-aaa-1111',
        idea_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        evaluator_id: '22222222-2222-2222-2222-222222222222',
        feasibility_score: 8,
        impact_score: 9,
        innovation_score: 7,
        overall_score: 8,
        feedback: 'Excellent idea with strong market potential. Implementation timeline is realistic and ROI projections are conservative.',
        recommendation: 'Strongly recommend for immediate implementation'
      },
      {
        id: 'eval-bbb-1111',
        idea_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        evaluator_id: '22222222-2222-2222-2222-222222222222',
        feasibility_score: 7,
        impact_score: 8,
        innovation_score: 6,
        overall_score: 7,
        feedback: 'Great sustainability initiative. Initial investment is high but long-term benefits are significant.',
        recommendation: 'Recommend with phased implementation approach'
      },
      {
        id: 'eval-ccc-1111',
        idea_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        evaluator_id: '22222222-2222-2222-2222-222222222222',
        feasibility_score: 9,
        impact_score: 8,
        innovation_score: 8,
        overall_score: 8,
        feedback: 'Innovative solution addressing current market needs. Technology is proven and scalable.',
        recommendation: 'Approve for full implementation'
      },
      {
        id: 'eval-ddd-1111',
        idea_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        evaluator_id: '33333333-3333-3333-3333-333333333333',
        feasibility_score: 8,
        impact_score: 9,
        innovation_score: 7,
        overall_score: 8,
        feedback: 'Customer-centric approach with excellent ROI potential. Implementation is straightforward.',
        recommendation: 'Approved - prioritize for Q1 launch'
      },
      {
        id: 'eval-eee-1111',
        idea_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        evaluator_id: '22222222-2222-2222-2222-222222222222',
        feasibility_score: 5,
        impact_score: 4,
        innovation_score: 6,
        overall_score: 5,
        feedback: 'While innovative, the implementation cost is too high for the projected returns. Market conditions are not favorable.',
        recommendation: 'Reject - revisit in 12 months'
      }
    ];

    const { error: evaluationsError } = await supabase
      .from("evaluations")
      .insert(sampleEvaluations);

    if (evaluationsError) {
      console.error("Error inserting sample evaluations:", evaluationsError);
      return;
    }

    // Add sample comments
    const sampleComments = [
      {
        id: 'comm-aaa-1',
        idea_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        user_id: '11111111-1111-1111-1111-111111111111',
        comment: 'I believe this could revolutionize our customer service operations. The AI technology has matured significantly.'
      },
      {
        id: 'comm-aaa-2',
        idea_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        user_id: '22222222-2222-2222-2222-222222222222',
        comment: 'Have we considered the training requirements for our support team? Change management will be crucial.'
      },
      {
        id: 'comm-aaa-3',
        idea_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        user_id: '33333333-3333-3333-3333-333333333333',
        comment: 'Excellent proposal. Let\'s schedule a pilot program with our largest client segment.'
      },
      {
        id: 'comm-bbb-1',
        idea_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        user_id: '11111111-1111-1111-1111-111111111111',
        comment: 'This aligns perfectly with our sustainability goals for 2024. The payback period is acceptable.'
      },
      {
        id: 'comm-bbb-2',
        idea_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        user_id: '22222222-2222-2222-2222-222222222222',
        comment: 'We should explore government incentives for renewable energy adoption to improve the ROI.'
      },
      {
        id: 'comm-ccc-1',
        idea_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        user_id: '33333333-3333-3333-3333-333333333333',
        comment: 'This addresses our immediate remote work challenges. Implementation should be our top priority.'
      },
      {
        id: 'comm-ddd-1',
        idea_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        user_id: '11111111-1111-1111-1111-111111111111',
        comment: 'The gamification aspect could really differentiate us from competitors. Great thinking!'
      },
      {
        id: 'comm-eee-1',
        idea_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        user_id: '22222222-2222-2222-2222-222222222222',
        comment: 'While the concept is sound, the current market conditions make this too risky for immediate implementation.'
      }
    ];

    const { error: commentsError } = await supabase
      .from("idea_comments")
      .insert(sampleComments);

    if (commentsError) {
      console.error("Error inserting sample comments:", commentsError);
      return;
    }

    console.log("Sample data seeded successfully!");
  } catch (error) {
    console.error("Error seeding sample data:", error);
  }
};
