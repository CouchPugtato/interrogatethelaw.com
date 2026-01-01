const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
// Ensure fetch is available globally for libraries that expect it (e.g., OpenAI)
if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = fetch;
}
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const LEGISCAN_API_KEY = process.env.LEGISCAN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  fetch, // pass explicit fetch for environments without global fetch
});

const formatPrompt = fs.readFileSync(path.resolve(__dirname, 'format_prompt.txt'),'utf8');

// conservative approximation 1 token ~ 3 characters
function estimateTokens(text) {
  return Math.ceil(text.length / 3);
}

// function to split text by a gramatical featurenpm
function splitByFeature(featureStr, chunk, maxTokens, maxChars, separator = '') {
  const features = chunk.split(featureStr);
  if (features.length <= 1) return null;
  
  const chunks = [];
  let currentChunk = '';
  
  for (const feature of features) {
    const testChunk = currentChunk + (currentChunk ? separator : '') + feature;
    
    if (testChunk.length <= maxChars) {
      currentChunk = testChunk;
    } else {
      if (currentChunk) {
        // recursively ensure the chunk is small enough
        chunks.push(...ensureChunkSize(currentChunk, maxTokens));
        currentChunk = feature;
      } else {
        // too large, split further
        chunks.push(...ensureChunkSize(feature, maxTokens));
      }
    }
  }
  
  if (currentChunk) chunks.push(...ensureChunkSize(currentChunk, maxTokens));
  return chunks;
}

// recursive function to ensure chunks are small enough
function ensureChunkSize(chunk, maxTokens) {
  const estimatedTokens = estimateTokens(chunk);
  
  if (estimatedTokens <= maxTokens) return [chunk];

  const maxChars = maxTokens * 3;
  
  const features = [
    { feature: /\n\s*\n/, separator: '\n\n' }, // paragraphs
    { feature: /\n/, separator: '\n' }, // lines
    { feature: /(?<=[.!?])\s+/, separator: ' ' }, // sentences
    { feature: /\s+/, separator: ' ' } // words
  ];
  
  for (const feature of features) {
    const result = splitByFeature(feature.feature, chunk, maxTokens, maxChars, feature.separator);
    if (result) return result;
  }
  
  // single word is too long, force split
  const words = chunk.split(/\s+/);
  if (words.length === 1) {
    const word = words[0];
    if (word.length > maxChars) {
      const chunks = [];
      for (let i = 0; i < word.length; i += maxChars) chunks.push(word.substring(i, i + maxChars));
      return chunks;
    }
  }
  
  // force split by character count if all else fails
  const result = [];
  for (let i = 0; i < chunk.length; i += maxChars) result.push(chunk.substring(i, i + maxChars));
  
  return result;
}

// function to split text into chunks that fit within token limits
function chunkText(text, maxTokens = 10000) { // conservative limit
  console.log(`Starting chunking process for text of ${text.length} characters`);
  
  const chunks = ensureChunkSize(text, maxTokens);
  
  // verify all chunks are within limits
  const oversizedChunks = chunks.filter(chunk => estimateTokens(chunk) > maxTokens);
  if (oversizedChunks.length > 0) {
    console.warn(`Warning: ${oversizedChunks.length} chunks still exceed token limit`);
    oversizedChunks.forEach((chunk, index) => {
      console.warn(`Oversized chunk ${index + 1}: ${estimateTokens(chunk)} tokens`);
    });
  }
  
  console.log(`Text split into ${chunks.length} chunks`);
  chunks.forEach((chunk, index) => {
    console.log(`Chunk ${index + 1}: ${chunk.length} chars, ~${estimateTokens(chunk)} tokens`);
  });
  return chunks;
}

// Endpoint to format bill text using ai model
app.post('/api/bill/format-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    console.log('Received text formatting request, text length:', text ? text.length : 0);
    
    if (!text) {
      console.log('Error: No text provided in request');
      return res.status(400).json({ error: 'Text parameter is required' });
    }
    
    if (!OPENAI_API_KEY) {
      console.log('Error: OpenAI API key not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    const estimatedTokens = estimateTokens(text);
    console.log('Estimated tokens:', estimatedTokens);
    
    if (estimatedTokens > 100000) { // does text need to be chunked?
      console.log('Text too large, splitting into chunks...');
      const chunks = chunkText(text);
      console.log(`Split into ${chunks.length} chunks`);
      
      const formattedChunks = [];
      
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}, length: ${chunks[i].length}`);
        
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: formatPrompt
              },
              {
                role: "user",
                content: `Please format this bill text chunk (${i + 1}/${chunks.length}) for better readability:\n\n${chunks[i]}`
              }
            ],
            max_tokens: 4096,
            temperature: 0.1
          });
          
          const formattedChunk = response.choices[0]?.message?.content || chunks[i];
          formattedChunks.push(formattedChunk);
          console.log(`Chunk ${i + 1} formatted successfully`);
          
          if (i < chunks.length - 1) await new Promise(resolve => setTimeout(resolve, 1000)); // small delay for rate limiting
        } catch (chunkError) {
          console.error(`Error formatting chunk ${i + 1}:`, chunkError.message);
          formattedChunks.push(chunks[i]); // use original chunk if fails
        }
      }
      
      const formattedText = formattedChunks.join('\n\n');
      console.log('All chunks processed, final text length:', formattedText.length);
      
      res.json({ formattedText });
    } else {
      console.log('Text size acceptable, processing as single chunk...');
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: formatPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 4096,
        temperature: 0.1
      });
      
      const formattedText = response.choices[0]?.message?.content || text;
      console.log('OpenAI formatting successful, formatted text length:', formattedText.length);
      
      res.json({ formattedText });
    }
  } catch (error) {
    console.error('Error formatting text with OpenAI:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Failed to format text', 
      details: error.message,
      originalText: req.body.text 
    });
  }
});

// endpoint to get master list of bills by state with optional status filter
app.get('/api/bills', async (req, res) => {
  try {
    const { state, status } = req.query;
    
    if (!state) return res.status(400).json({ error: 'State parameter is required' });
    
    let url = `https://api.legiscan.com/?key=${LEGISCAN_API_KEY}&op=getMasterList&state=${state}`;
    if (status) url += `&status=${status}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('LegiScan API error');
    
    const data = await response.json();
    
    // sort bills by last action date (most recent first) if no specific status requested
    if (!status && data.masterlist) {
      const billsArray = Object.entries(data.masterlist).map(([key, bill]) => ({
        key,
        ...bill
      }));
      
      // sort by most recent
      billsArray.sort((a, b) => {
        const dateA = new Date(a.status_date || a.last_action_date || '1900-01-01');
        const dateB = new Date(b.status_date || b.last_action_date || '1900-01-01');
        return dateB - dateA;
      });
      
      // convert back to object format
      const sortedBills = {};
      billsArray.forEach(bill => {
        const { key, ...billData } = bill;
        sortedBills[key] = billData;
      });
      
      data.masterlist = sortedBills;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching from LegiScan:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// endpoint to get details of a specific bill
app.get('/api/bill/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Bill ID is required' });
    }
    
    const response = await fetch(
      `https://api.legiscan.com/?key=${LEGISCAN_API_KEY}&op=getBill&id=${id}`
    );
    
    if (!response.ok) {
      throw new Error('LegiScan API error');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching from LegiScan:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// endpoint to get bill text content
app.get('/api/bill/:id/text/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    
    if (!docId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }
    
    const response = await fetch(
      `https://api.legiscan.com/?key=${LEGISCAN_API_KEY}&op=getBillText&id=${docId}`
    );
    
    if (!response.ok) {
      throw new Error('LegiScan API error');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching bill text from LegiScan:', error);
    res.status(500).json({ error: 'Failed to fetch bill text' });
  }
});

// serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
}

//chat gpt summary call


app.post("/api/summarize", async (req, res) => {
  console.log("Processing /api/summarize request");
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return res.status(500).json({ error: "Server configuration error: Missing API Key" });
    }

    const { text , level} = req.body;
    console.log(`Summarize request: level=${level}, textLength=${text ? text.length : 0}`);

    if (!text) {
      console.warn("Summarize request missing text");
      return res.status(400).json({ error: "No text provided" });
    }

    let levelInstruction = "";

    switch (level) {
      case "easy": 
        levelInstruction = "Summarize what the text is saying in one or two sentences that a middle schooler could understand";
        break;
      case "medium":
        levelInstruction = "Summarize what the text is saying using clear, conversational language appropriate for a high school student.";
       
        break;
      case "hard":
        levelInstruction =  "Summarize what the text is saying using  precise, formal, and technical language appropriate for academic readers.";
       
        break;
      default:
        levelInstruction = "Summarize what the text is saying ";
        
    }
    
    console.log("Calling OpenAI API...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: levelInstruction },
        { role: "user", content: text },
      ],
      max_tokens: 500,
      temperature: 0.1,
    });
    console.log("OpenAI response received");

    const summary = response.choices[0]?.message?.content || "";
    res.json({ summary });
  } catch (err) {
    console.error("Error in /api/summarize:", err);
    res.status(500).json({ 
      error: "Failed to summarize", 
      details: err.message 
    });
  }
});

// Temp localhost for non production testing
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));