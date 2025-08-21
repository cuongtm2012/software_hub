import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export class GeminiChatService {
  private model: any;
  private chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.initializeContext();
  }

  private initializeContext() {
    // Initialize with context about the software marketplace
    this.chatHistory = [
      {
        role: "user",
        parts: [{ text: "Bạn là trợ lý AI hỗ trợ khách hàng của Software Hub - một nền tảng marketplace phần mềm. Nhiệm vụ của bạn là giúp đỡ khách hàng về: thanh toán, theo dõi đơn hàng, license key, và các câu hỏi về sản phẩm. Hãy trả lời ngắn gọn, thân thiện và chuyên nghiệp bằng tiếng Việt." }]
      },
      {
        role: "model",
        parts: [{ text: "Xin chào! Tôi là trợ lý AI của Software Hub. Tôi sẵn sàng hỗ trợ bạn về mọi vấn đề liên quan đến thanh toán, đơn hàng, license key và sản phẩm. Bạn cần tôi giúp gì?" }]
      }
    ];
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Add user message to history
      this.chatHistory.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Start chat with history
      const chat = this.model.startChat({
        history: this.chatHistory.slice(0, -1), // Exclude the last message we just added
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      // Send message and get response
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const responseText = response.text();

      // Add AI response to history
      this.chatHistory.push({
        role: "model",
        parts: [{ text: responseText }]
      });

      // Keep only last 20 messages to prevent context overflow
      if (this.chatHistory.length > 20) {
        this.chatHistory = [
          this.chatHistory[0], // Keep initial context
          this.chatHistory[1],
          ...this.chatHistory.slice(-18) // Keep last 18 messages
        ];
      }

      return responseText;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Không thể kết nối với AI assistant. Vui lòng thử lại sau.');
    }
  }

  resetChat() {
    this.initializeContext();
  }
}

export const geminiChatService = new GeminiChatService();
