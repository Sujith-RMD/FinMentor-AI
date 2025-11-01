import { GoogleGenAI, Modality, type Content } from '@google/genai';
import { 
  GEMINI_FLASH_MODEL, 
  GEMINI_PRO_MODEL, 
  GEMINI_IMAGE_MODEL 
} from '../constants';
import { type PortfolioData, type AIPortfolioAnalysisResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are FinMentor AI, an expert Indian financial research chatbot. Your goal is to provide **brief, direct, and data-driven answers**. Use **bullet points** or short sentences. **Avoid long paragraphs**.
- Your expertise is strictly the **Indian market (NSE/BSE)**.
- For complex queries, you perform deep analysis.
- For general queries, you use search to get real-time data.
- If a query is not about finance or the Indian market, politely state your purpose.`;

const generateResponse = async (model: string, history: Content[], config: any = {}): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: history,
      config: {
        systemInstruction,
        ...config,
      },
    });
    return response.text;
  } catch (error) {
    console.error(`Gemini API error for model ${model}:`, error);
    return "There was an error connecting to the financial data services. Please check your connection or API key and try again.";
  }
};

export const generateStandardResponse = (history: Content[]) => 
  generateResponse(GEMINI_FLASH_MODEL, history, { tools: [{ googleSearch: {} }] });

export const generateDeepAnalysis = (history: Content[]) => 
  generateResponse(GEMINI_PRO_MODEL, history, { thinkingConfig: { thinkingBudget: 32768 } });

export const generatePortfolioAnalysis = async (data: PortfolioData): Promise<AIPortfolioAnalysisResponse> => {
    const { initialCapital, monthlyInvestment, riskAppetite, preferredTools } = data;

    const apiPrompt = `Analyze the following Indian investor profile and generate a diversified investment portfolio.

      **Investor Profile:**
      - **Risk Profile:** ${riskAppetite}
      - **Initial Lump Sum:** ₹${initialCapital.toLocaleString('en-IN')}
      - **Monthly SIP:** ₹${monthlyInvestment.toLocaleString('en-IN')}
      - **Preferred Tools:** ${preferredTools.join(', ') || 'All standard tools'}

      **Your Task:**
      1.  Use your search tool to find 3-5 top-performing, relevant investment assets (Mutual Funds, Stocks from NSE/BSE, etc.) suitable for this profile.
      2.  Determine an appropriate percentage allocation for each asset. The total percentage must equal 100.
      3.  Provide a brief rationale for your strategy and a projected annual return range (e.g., "10-14%").
      4.  For each recommended asset, provide a concise string of key metrics (e.g., "1Y Return: 15.2%, Expense Ratio: 0.5%").
      5.  Return the entire response as a single JSON object inside a \`\`\`json markdown block. Do NOT include any text outside of the JSON block.

      **JSON Structure:**
      {
        "rationale": "string",
        "projectedReturn": "string",
        "allocations": [
          {
            "name": "string",
            "percentage": number,
            "metrics": "string"
          }
        ]
      }`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_PRO_MODEL,
            contents: [{ role: "user", parts: [{ text: apiPrompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
                // Removed responseMimeType and responseSchema to fix the API error with tools.
            },
        });
        const jsonText = response.text.trim();
        const cleanedJson = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
        const parsed = JSON.parse(cleanedJson) as AIPortfolioAnalysisResponse;
        if (!parsed.allocations || !parsed.rationale || !parsed.projectedReturn) {
             throw new Error("Parsed JSON is missing required fields.");
        }
        return parsed;
    } catch (error) {
        console.error("Error generating or parsing portfolio analysis:", error);
        return {
            rationale: "There was an error generating the portfolio analysis. The AI model's response was not in the expected format. Please try adjusting your inputs or try again later.",
            projectedReturn: "N/A",
            allocations: []
        };
    }
};


export const generateImageResponse = async (prompt: string): Promise<string | null> => {
  const imageGenerationPrompt = `Generate a modern, clean, and professional 2D financial pie chart based on the following data for an Indian investor's portfolio: ${prompt}. The chart should be visually appealing, using a balanced color palette appropriate for a financial document. Include clear labels for each segment and a legend.`;
  
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: {
        parts: [{ text: imageGenerationPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image API error:", error);
    return null;
  }
};
