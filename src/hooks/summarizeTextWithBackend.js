const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:3001/api';


export async function summarizeTextWithBackend(text, level) {
  try {
    const url = `${API_BASE_URL}/summarize`;
    // console.log("Calling summarize API at:", url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, level }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.details || 'Unknown error');
    }
    
    const data = await response.json();
    
    return data.summary || "No summary returned";
  } catch (error) {
    throw error;
  }
};
