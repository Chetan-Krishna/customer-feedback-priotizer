import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing feedback with AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a product feedback analysis AI. Analyze customer feedback and extract individual feedback items with urgency and impact scores.
            
For each piece of feedback, return:
- title: A clear, concise summary
- category: The feature area (e.g., "UI/UX", "Performance", "Feature Request", "Bug")
- urgency: How quickly it needs addressing (1-10)
- impact: How many users it affects (1-10)
- sentiment: positive, neutral, or negative
- summary: Brief explanation of the issue

Return a JSON array of feedback items.`
          },
          {
            role: 'user',
            content: `Analyze this customer feedback and extract individual items:\n\n${feedbackText}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_feedback",
              description: "Extract and analyze individual feedback items",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        category: { type: "string" },
                        urgency: { type: "number", minimum: 1, maximum: 10 },
                        impact: { type: "number", minimum: 1, maximum: 10 },
                        sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                        summary: { type: "string" }
                      },
                      required: ["title", "category", "urgency", "impact", "sentiment", "summary"]
                    }
                  }
                },
                required: ["items"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_feedback" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    console.log('AI response received');

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);
    
    // Calculate priority score (urgency + impact) for each item
    const itemsWithPriority = analysisResult.items.map((item: any) => ({
      ...item,
      priorityScore: item.urgency + item.impact,
      id: crypto.randomUUID()
    }));

    // Sort by priority
    itemsWithPriority.sort((a: any, b: any) => b.priorityScore - a.priorityScore);

    console.log(`Analyzed ${itemsWithPriority.length} feedback items`);

    return new Response(
      JSON.stringify({ items: itemsWithPriority }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-feedback function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
