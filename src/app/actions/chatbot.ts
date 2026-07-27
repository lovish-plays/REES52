'use server';

type GeminiHistoryItem = {
  role: 'user' | 'model';
  parts: string;
};

export async function askAelosAiAction(prompt: string, history: GeminiHistoryItem[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash';

  if (!apiKey) {
    console.error("[CHATBOT ACTION ERROR] OPENROUTER_API_KEY is not defined!");
    return { success: false, error: "AI Chatbot configuration is missing on the server." };
  }

  const systemInstruction = 
    "You are AELOS, a state-of-the-art educational humanoid robot sold by REES52. " +
    "You help students and makers learn robotics, Arduino, IoT sensors, and drone DIY building. " +
    "You are friendly, smart, and enthusiastic about engineering. " +
    "CRITICAL DIRECTIVE: You must ONLY answer questions directly related to this domain (robotics, Arduino, sensors, drone DIY, electronics, engineering, REES52 kits, ebooks, video lectures, and REES52 Academy). " +
    "If a user asks about anything outside of this domain—such as general knowledge, pop culture, politics, sports, creative writing, history, cooking, or general programming unrelated to hardware/robotics—you must politely refuse to answer and remind them that you are an assistant dedicated exclusively to robotics, electronics, and the REES52 portal. " +
    "Be concise, keep answers under 3-4 sentences, and format with clean text. Suggest checking out the " +
    "relevant ebooks (like the Uno R3 guide or Sensors Handbook) and free video lectures available on the " +
    "REES52 Academy when asked about those topics. You are speaking directly to a user in a chat window.";

  // OpenRouter uses standard chat completions payload format:
  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map(h => ({
      role: (h.role === 'user' ? 'user' as const : 'assistant' as const),
      content: h.parts
    })),
    { role: 'user', content: prompt }
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "REES52 Academy"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OPENROUTER API ERROR RESPONSE]", errorText);
      return { success: false, error: `OpenRouter returned status ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const botText = data.choices?.[0]?.message?.content;
    
    if (!botText) {
      return { success: false, error: "Empty response from OpenRouter model" };
    }

    return { success: true, text: botText };
  } catch (error: any) {
    console.error("[OPENROUTER API EXCEPTION]", error);
    return { success: false, error: error.message || "Failed to contact OpenRouter API" };
  }
}
