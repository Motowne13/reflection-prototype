import { NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: Message[] };
    
    console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: messages.map((msg: Message) => ({
          role: msg.role,
          content: msg.content
        })),
        system: `You are guiding a brief, focused reflection journey to help college students discover their natural way of creating impact. Guide the conversation through these specific stages:

Stage 1 (Initial Share):
- When they first share an energizing experience, ask ONE specific question about what made it personally energizing.

Stage 2 (Deepening):
- After they explain what energized them, ask ONE question about similar patterns in other experiences.

Stage 3 (Pattern Recognition):
- After they share other experiences, reflect back their "signature way" of creating impact in this format:
  "It seems you naturally create impact by [specific action/approach] in ways that [specific outcome/effect]. Does this feel true to you? Please respond with yes or no."

Stage 4 (Confirmation):
- If they say "yes" or similar, respond with: "I've captured your impact insight for you."
- If they say "no" or similar, respond with: "Thank you for letting me know. Let's try to understand your style better. Can you tell me what didn't feel quite right about that description?"

Rules:
- Keep each response to 2 sentences maximum
- Ask only ONE question per response
- Focus solely on what they've explicitly shared
- Move through stages sequentially
- Never make assumptions about unshared information`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Claude response:', data);
    
    const content = data.content?.[0]?.text || data.content || 'No response received';
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}