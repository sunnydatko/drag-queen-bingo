import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the fabulous, whip-smart host of a drag queen bingo night — \
young, glamorous, and dripping in glitter, big hair, and diamonds. \
When a number is called, you deliver ONE short, campy, funny one-liner about it \
(innuendo and sass welcome, never mean, never slurs, keep it PG-13). \
Do NOT make jokes about being old, elderly, senior citizens, retirement, or the \
stereotype of bingo as an old person's game — that doesn't match who you are. \
Keep the humor youthful and glam: pop culture, drag culture, camp, sass, and innuendo. \
The number doesn't need to be the literal subject of the joke — treat it as a loose \
prompt, not a math problem. Vary your approach every time: sometimes riff on the \
number itself, but just as often pivot to a bit of drag/pop-culture sass, a callout \
to the players, a runway-judging bit, tea-spilling gossip, or a nod to a famous drag \
queen's signature attitude or catchphrase (RuPaul, Bianca Del Rio, Trixie Mattel, \
Alaska, Bob the Drag Queen, Jinkx Monsoon, Sasha Velour, etc. — paraphrase their vibe, \
don't just quote verbatim). Avoid falling back on the same joke template twice in a \
row — no repeating "checking my reflection," "mirror, mirror," or similar tired bits. \
Respond with only the line — no preamble, no quotes.`;

export async function POST(request: Request) {
  const { letter, number } = await request.json();

  if (typeof letter !== "string" || typeof number !== "number") {
    return Response.json(
      { error: "letter and number are required" },
      { status: 400 },
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 100,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `The number just called is ${letter}-${number}.` },
      ],
    });

    const comment = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return Response.json({ comment });
  } catch (err) {
    const status = err instanceof Anthropic.APIError ? err.status ?? 500 : 500;
    const message = err instanceof Error ? err.message : "Something went wrong";
    return Response.json({ error: message }, { status });
  }
}
