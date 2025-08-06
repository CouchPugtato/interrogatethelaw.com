const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // in production the API is on the same domain
  : 'http://localhost:3001/api'; // while developing use localhost


// WIP formatting with openai model, takes 7-8 minutes to load a single bill while not improving readability
export async function formatTextWithBackend(text) {
  // try {
  //   console.log('Sending text to backend for formatting, length:', text.length);
    
  //   const response = await fetch('${API_BASE_URL}/bill/format-text', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ text }),
  //   });
    
  //   console.log('Backend response status:', response.status);
    
  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     console.error('Backend formatting error:', errorData);
  //     throw new Error(`Backend formatting failed: ${errorData.error || 'Unknown error'}`);
  //   }
    
  //   const data = await response.json();
  //   console.log('Received formatted text from backend, length:', data.formattedText ? data.formattedText.length : 0);
    
  //   return data.formattedText || text;
  // } catch (error) {
  //   console.error('Error formatting text with backend:', error);
  //   console.error('Returning original text due to formatting error');
  //   return text; // Return original text if formatting fails
  // }
  return text;
};