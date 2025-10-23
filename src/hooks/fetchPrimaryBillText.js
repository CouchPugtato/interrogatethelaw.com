import { formatTextWithBackend } from './formatTextWithBackend';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // in production the API is on the same domain
  : 'http://localhost:3001/api'; // while developing use localhost


export async function fetchPrimaryBillText(data, setBillText, setLoadingText) {
    if (!data?.bill?.texts || data.bill.texts.length === 0) return;
    
    setLoadingText(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bill/${data.bill.bill_id}/text/${data.bill.texts[0].doc_id}`);
      const textData = await response.json();
      
      // multiple possible response structures because why not
      let encodedContent = null;
      if (textData.text && textData.text.doc) encodedContent = textData.text.doc;
      else if (textData.text) encodedContent = textData.text;
      else if (textData.doc) encodedContent = textData.doc;
      
      if (encodedContent) {
        // detect PDF content to avoid rendering binary gibberish
        const looksLikePdfBase64 = encodedContent.startsWith('JVBER');
        let looksLikePdfDecoded = false;
        try {
          const head = atob(encodedContent.slice(0, 16));
          looksLikePdfDecoded = head.startsWith('%PDF');
        } catch (_) {}
        if (looksLikePdfBase64 || looksLikePdfDecoded) {
  try {
    const resp = await fetch(`${API_BASE_URL}/pdf-to-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64: encodedContent })
    });
    const result = await resp.json();
    const extracted = result?.text || '';
    if (extracted && extracted.trim().length > 0) {
      const formattedText = await formatTextWithBackend(extracted);
      setBillText(formattedText);
      return;
    }
  } catch (pdfErr) {
    console.error('PDF text extraction failed:', pdfErr);
  }
  const pdfEmbed = `<object data="data:application/pdf;base64,${encodedContent}" type="application/pdf" width="100%" height="800">This bill text is a PDF. <a href="data:application/pdf;base64,${encodedContent}" target="_blank" rel="noopener noreferrer">Open in new tab</a>.</object>`;
  setBillText(pdfEmbed);
  return;
}
         
try {
          const decodedContent = atob(encodedContent);
          
          // fix basic character encoding issues
          let htmlContent = decodedContent
            .replace(/Â/g, '') // Remove stray Â characters
            .replace(/\u00A0/g, ' ') // Replace non-breaking spaces with regular spaces
            .replace(/â€™/g, "'") // Fix apostrophes
            .replace(/â€œ/g, '"') // Fix opening quotes
            .replace(/â€/g, '"') // Fix closing quotes
            .replace(/â€"/g, '—') // Fix em dashes
            .replace(/â€"/g, '–'); // Fix en dashes
          
          const formattedText = await formatTextWithBackend(htmlContent);
          setBillText(formattedText);
        } catch (decodeError) {
          console.error('Error decoding bill text:', decodeError);
          // if Base64 decoding fails, try treating it as regular HTML
          let htmlContent = encodedContent
            .replace(/Â/g, '')
            .replace(/\u00A0/g, ' ')
            .replace(/â€™/g, "'")
            .replace(/â€œ/g, '"')
            .replace(/â€/g, '"') 
            .replace(/â€"/g, '—')
            .replace(/â€"/g, '–');
  
          const formattedText = await formatTextWithBackend(htmlContent);
          setBillText(formattedText);
        }
      } else {
        setBillText('No bill text content available.');
      }
    } catch (error) {
      console.error('Error fetching bill text:', error);
      setBillText('Error loading bill text.');
    } finally {
      setLoadingText(false);
    }
}