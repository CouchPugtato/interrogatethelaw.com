const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();




const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "No text provided" });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "summarize in a couple sentences what the text is saying. " },
        { role: "user", content: text },
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const summary = response.choices[0]?.message?.content || "";
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to summarize" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} in use. Try a different one.`);
    }
  });