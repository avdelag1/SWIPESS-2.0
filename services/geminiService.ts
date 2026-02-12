
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ListingCategory, AIFilters, Listing, InteractionRecord } from "../types";

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  static async chat(message: string, history: any[]) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are a helpful AI assistant for Swipess, a Tinder-style marketplace. Provide concise, relevant, and friendly answers. Help users find matches or owners build great listings."
      }
    });
    return response.text;
  }

  /**
   * Parses natural language search queries into structured AIFilters.
   */
  static async extractFiltersFromQuery(query: string): Promise<AIFilters> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: {
        systemInstruction: `Analyze the user's marketplace search query and extract structured filters.
        Categories mapping:
        - "property", "apartment", "house", "loft", "villa", "penthouse" -> property
        - "car", "motorcycle", "moto", "vehicle", "porsche", "ducati" -> moto
        - "bicycle", "bike", "cycle", "road bike", "mountain bike" -> bicycle
        - "job", "worker", "tasker", "developer", "designer", "hire" -> tasker

        Return a JSON object following the AIFilters interface:
        {
          "maxPrice": number | null,
          "category": "property" | "moto" | "bicycle" | "tasker" | null,
          "location": string | null,
          "tags": string[] | null,
          "searchQuery": string | null
        }
        
        Examples:
        "penthouse under 2500 in madrid" -> { "category": "property", "maxPrice": 2500, "location": "Madrid", "tags": ["penthouse"] }
        "developer for 50 an hour" -> { "category": "tasker", "maxPrice": 50, "tags": ["developer"] }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            maxPrice: { type: Type.NUMBER, nullable: true },
            category: { type: Type.STRING, nullable: true },
            location: { type: Type.STRING, nullable: true },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
            searchQuery: { type: Type.STRING, nullable: true }
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse AI filters:", e);
      return {};
    }
  }

  /**
   * Generates a high-quality professional listing using Gemini 3 Pro.
   */
  static async generateOptimizedListing(shortDescription: string, category: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Create a professional and high-converting ${category} listing for: ${shortDescription}` }] 
      }],
      config: {
        systemInstruction: `You are the Swipess Magic Marketplace Agent. 
        Your task is to transform raw user notes into professional, high-converting marketplace listings.
        
        Guidelines:
        - Generate a catchy, SEO-optimized title.
        - Write a persuasive, professional description (approx 150 words).
        - Create 5 bulleted key features.
        - Suggest 6-8 relevant tags.
        - Suggest a market-competitive price (e.g., "€1.200/mo" for property or "€45/hr" for tasker).
        
        Rules:
        - For 'property' rentals: apply a 3-month minimum / 1-year maximum rule in the description.
        - For 'tasker': focus on specific deliverables and professional reliability.
        - Always return valid JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy listing title" },
            description: { type: Type.STRING, description: "Full professional description" },
            features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 key features" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant keywords" },
            suggestedPrice: { type: Type.STRING, description: "Formatted price string with currency" }
          },
          required: ["title", "description", "features", "tags", "suggestedPrice"]
        }
      }
    });
    
    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text);
  }

  /**
   * Smart Recommendations: Ranks candidate listings based on user interaction history.
   */
  static async rankRecommendations(history: InteractionRecord[], candidates: Listing[]): Promise<string[]> {
    const ai = this.getAI();
    const historySummary = history.map(h => {
      const listing = candidates.find(c => c.id === h.listingId);
      return `Listing: ${listing?.title || h.listingId}, Action: ${h.action}, Duration: ${h.duration}ms, Tags: ${listing?.tags?.join(', ') || 'N/A'}`;
    }).join('\n');

    const candidateSummary = candidates.map(c => `ID: ${c.id}, Title: ${c.title}, Tags: ${c.tags.join(', ')}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        role: 'user',
        parts: [{ text: `Based on the user's interaction history, rank these candidate listing IDs by predicted interest (highest interest first). Return only a JSON array of strings.

User History:
${historySummary}

Candidates:
${candidateSummary}` }]
      }],
      config: {
        systemInstruction: "You are a recommendation engine for a tinder-style marketplace. Analyze behavior patterns (likes, dislikes, long views) to rank candidates. Return a JSON array of the top 10 most relevant IDs.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse recommendation ranking:", e);
      return candidates.map(c => c.id);
    }
  }

  static async analyzeListingImage(base64Image: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Analyze this image and suggest tags and features." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            detectedFeatures: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  static async generateSpeech(text: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }

  static async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16") {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in model response.");
  }

  static async generateVideo(prompt: string) {
    const ai = this.getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: no download link.");
    return `${downloadLink}&key=${process.env.API_KEY}`;
  }
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
