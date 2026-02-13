import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, type } = await req.json();

    if (!name || !type) {
      return new Response(
        JSON.stringify({ error: "Name and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use tool calling for structured output - much faster than parsing JSON from text
    const tools = type === "drug" 
      ? [{
          type: "function",
          function: {
            name: "return_drug_data",
            description: "Return structured drug molecular data",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Drug name" },
                smiles: { type: "string", description: "Valid SMILES notation" },
                molecular_weight: { type: "number", description: "Molecular weight in g/mol" },
                formula: { type: "string", description: "Molecular formula" },
                description: { type: "string", description: "Brief description of the drug" }
              },
              required: ["name", "smiles", "molecular_weight", "formula", "description"],
              additionalProperties: false
            }
          }
        }]
      : [{
          type: "function",
          function: {
            name: "return_protein_data",
            description: "Return structured protein data",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Protein name" },
                fasta: { type: "string", description: "FASTA amino acid sequence (100-300 residues)" },
                length: { type: "number", description: "Number of amino acids" },
                uniprot_id: { type: "string", description: "UniProt ID or N/A" },
                description: { type: "string", description: "Brief description of the protein" }
              },
              required: ["name", "fasta", "length", "uniprot_id", "description"],
              additionalProperties: false
            }
          }
        }];

    const prompt = type === "drug" 
      ? `Provide SMILES and molecular data for the drug: ${name}`
      : `Provide FASTA sequence and data for the protein: ${name}`;

    const requestBody = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a biochemistry expert. Provide accurate molecular data." },
        { role: "user", content: prompt }
      ],
      tools,
      tool_choice: { type: "function", function: { name: type === "drug" ? "return_drug_data" : "return_protein_data" } },
      temperature: 0.1,
      max_tokens: 1000,
    };

    console.log("Sending request:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error response:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log("AI response:", JSON.stringify(aiResponse, null, 2));
    
    const message = aiResponse.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];
    const content = message?.content;

    // Parse tool call response (structured output) - this is the expected path
    let result;
    try {
      if (toolCall?.function?.arguments) {
        result = JSON.parse(toolCall.function.arguments);
      } else if (content && content.trim()) {
        // Fallback to content parsing if no tool call
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        result = JSON.parse(cleanContent);
      } else {
        console.error("No valid response data:", { message, toolCall, content });
        throw new Error("No response from AI model");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, { toolCall, content });
      throw new Error("Failed to parse molecule data");
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate molecule error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});