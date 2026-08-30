# Reflection Engine

Reflection Engine is a single prompt you hand to your AI assistant. It reads across everything that assistant already knows about you — chat history, memory, uploaded files — and writes back a candid, evidence-grounded portrait: your blind spots, the contradictions that explain the most, your most expensive habits, and where your current trajectory is actually heading.

You get 22 direct answers. Each one cites the evidence behind it, scores its own confidence, and ends with one concrete thing you can try this week.

## How to use it

1. **Open [Reflection-Engine-v1.3.md](Reflection-Engine-v1.3.md), then select GitHub's Download raw file button.**

2. **Open the account where you actually talk.** Not your coding assistant — the one where you've also worked through relationships, money, health, family, and half-formed 2am ideas. Reflection Engine is only as good as the corpus it can see, and a corpus of pull requests produces a portrait of a developer, not of you.

3. **Pick the newest model, with reasoning set as high as it goes.** It has to hold evidence across years of material and weigh counterevidence against it. A fast, cheap model will hand you a horoscope.

4. **Check that memory and chat history are switched on** in that assistant's settings — memory and "reference chat history" in ChatGPT, memory and past-chat search in Claude, personal context in Gemini. With those off, the model is working from a single blank conversation and the whole exercise falls apart.

5. **Start a fresh conversation, attach the file, and send this:**

```text
Please evaluate the attached markdown file and complete all tasks.
```

Then let it run. Good output takes a while.

## Security

Reflection Engine is a prompt, not a product. There's no service, no account, no install, and no telemetry — just a markdown file you attach to a conversation you're already having.

That means your data never leaves the AI provider you chose. Nothing is sent back to the author of this prompt or to anyone else — there's no server in the loop to send it to. No third party is added to the trust boundary you already accepted when you signed up with that provider.

One caution on the way out: **the output is sensitive.** It's a blunt read on you, drawn from your most personal conversations. Keep it somewhere private, and think twice before pasting it into a shared workspace or team chat.

---

Reflection Engine is designed to be uncomfortable in a useful way, not cruel. It isn't therapy, and it isn't a diagnosis — it's a sharp outside read on patterns that are hard to see from the inside.

The prompt deliberately tells the model that a third party wrote it, so the model never mistakes the questions for your own words and never treats your curiosity as evidence about you. Don't add your name to the file.

Built by Kevin Rose — [X](https://x.com/kevinrose) · [Instagram](https://instagram.com/kevinrose)
