/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `
You are JARVIS, a highly sophisticated AI assistant. 
Your personality is professional, efficient, witty, and loyal. 
Inspired by the Jarvis from Iron Man comics/movies.

You provide concise and helpful responses. 
You can simulate desktop assistant operations by using specific "action" markers in your responses if the user asks for things like checking weather, opening apps, or system checks.
Action markers: [ACTION: OPEN_URL: <url>], [ACTION: NOTIFY: <message>], [ACTION: SYSTEM_CHECK].

Keep your tone consistent (e.g., using "sir" or "at your service").
`;

export async function chatWithJarvis(history: Message[], currentMessage: string) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    // Convert history to Gemini format if needed, but for simplicity we can just send the messages
    // The library usually handles content history
    const response = await chat.sendMessage({ message: currentMessage });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I apologize, sir, but I am experiencing some internal interference. Please try again.";
  }
}
