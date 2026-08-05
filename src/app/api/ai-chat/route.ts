import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // In the future, this is where you will connect to OpenAI, Anthropic, or Gemini APIs.
    // Example:
    // const openAiApiKey = process.env.OPENAI_API_KEY;
    // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... })

    // Simulate network delay for realistic UI feedback
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // MOCK RESPONSE
    // We generate a conversational reply and 2 design suggestions.
    const reply = `I've analyzed your request for "${prompt}" and generated a few excellent post ideas tailored for high engagement. You can click "Use this Design" on any of them to immediately load it into your editor!`;

    const designs = [
      {
        id: `ai-gen-${Date.now()}-1`,
        network: "Instagram",
        caption: `✨ Exciting news! We've been working on something special just for you.\n\nDrop a 🚀 in the comments if you're ready for the big reveal tomorrow!\n\n#ComingSoon #BigReveal #ExcitingNews`,
        mediaUrl: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=600",
        promptUsed: prompt
      },
      {
        id: `ai-gen-${Date.now()}-2`,
        network: "Twitter",
        caption: `Quick tip 💡: Consistency is the key to mastering anything. What is one habit you're trying to build this month?\n\nLet us know below! 👇`,
        mediaUrl: null, // Text only post
        promptUsed: prompt
      }
    ];

    return NextResponse.json({
      reply,
      designs
    });

  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
