import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION, IMAGE_GENERATION_PROMPT_TEMPLATE } from '../constants';

// Initialize Gemini Client
// Note: process.env.API_KEY is guaranteed to be available in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a text response from EmotiMate (the bunny).
 */
export const generateEmotiMateResponse = async (
  userAction: string,
  bunnyState: string,
  history: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Current Bunny State: ${bunnyState}
        User just did: ${userAction}
        Recent History: ${history}
        
        Respond to the user in Hebrew as the bunny.
      `,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "משהו השתבש, בוא ננסה שוב.";
  } catch (error) {
    console.error("Error generating text:", error);
    return "אני קצת מבולבל כרגע, אפשר לנסות שוב?";
  }
};

/**
 * Generates an image of the bunny based on current context.
 */
export const generateBunnyImage = async (
  action: string,
  emotion: string
): Promise<string | null> => {
  try {
    const prompt = IMAGE_GENERATION_PROMPT_TEMPLATE
      .replace('{action}', action)
      .replace('{emotion}', emotion);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        // No responseMimeType for image generation models usually, relying on parts
      }
    });

    // Extract image from parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

/**
 * Generates speech (TTS) from the text.
 */
export const generateBunnySpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Gentle voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        // Standardize header for browser playback if needed, though often raw PCM needs decoding.
        // The prompt examples show specific decoding for PCM. 
        // For simplicity in this Web App context, we will try to return the raw base64 
        // and let the client decode it using the AudioContext approach shown in guidance.
        return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};