import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLegiScanProxy } from '../hooks/useLegiScanProxy';
import { fetchPrimaryBillText } from '../hooks/fetchPrimaryBillText';
import { summarizeTextWithBackend } from '../hooks/summarizeTextWithBackend';
import React from 'react';
import './BillDetailPage.css';

function BillDetailPage() {



  //popup box code
  const [explainationLevel, setExplainationLevel] = useState("easy");
  const [selection, setSelection] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleDropdownChange = (event) => {
    const value = event.target.value;
    setExplainationLevel(value);
    console.log("Selected value:", value);
  };


  const handleMouseUp = () => {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      setSelection(selectedText);
      setShowPopup(true);
      setSummary("");
    } else {
      setShowPopup(false);
    }
  };

  const summarizeText = async (text) => {
    try {
      setLoadingSummary(true);
      const summaryText = await summarizeTextWithBackend(text, explainationLevel);
      setSummary(summaryText);
    } catch (err) {
      console.error("Summarization error:", err);
      setSummary(`Failed to summarize: ${err.message}`);
    } finally {
      setLoadingSummary(false);
    }
      
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  

    // bill detail page code

  const { billId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useLegiScanProxy(`bill/${billId}`);
  const [billText, setBillText] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  useEffect(() => {
    if (data?.bill?.texts && data.bill.texts.length > 0) {
      fetchPrimaryBillText(data, setBillText, setLoadingText);
    }
  }, [data]);
  
  if (loading) return (
    <div className="bill-detail-page">
      <button className="home-button" onClick={handleGoHome}>← Bills</button>
      <p>Loading bill details...</p>
    </div>
  );
  
  if (error) return (
    <div className="bill-detail-page">
      <button className="home-button" onClick={handleGoHome}>← Bills</button>
      <p>Error loading bill details: {error}</p>
    </div>
  );
  
  if (!data || !data.bill) return (
    <div className="bill-detail-page">
      <button className="home-button" onClick={handleGoHome}>← Bills</button>
      <p>No bill details available</p>
    </div>
  );
  
  const bill = data.bill;
  //CSS styles

 return (
    <div className="bg-gradient-animate">
      <div className="bill-card">
        <div className="bill-controls">
          <button className="home-button" onClick={handleGoHome}>
            ← Bills
          </button>
          <select
            className="level-select"
            value={explainationLevel}
            onChange={handleDropdownChange}
          >
            <option value="disabled" disabled>
              Select explanation level
            </option>
            <option value="easy">Brief</option>
            <option value="medium">Standard</option>
            <option value="hard">In Depth</option>
          </select>
        </div>

        <div className="section-card">
          <h2 className="section-title">
            {bill.bill_number}: {bill.title}
          </h2>
          <p><strong>State:</strong> {bill.state}</p>
          <p><strong>Session:</strong> {bill.session.name}</p>
          <p><strong>Status:</strong> {bill.status}</p>
          <p><strong>Description:</strong> {bill.description || "No description available"}</p>
        </div>

        {bill.sponsors?.length > 0 && (
          <div className="section-card">
            <h3 className="section-title">Sponsors</h3>
            <ul>
              {bill.sponsors.map((s) => (
                <li key={s.people_id}>{s.name} ({s.party})</li>
              ))}
            </ul>
          </div>
        )}

        <div className="section-card">
          <h3 className="section-title">Full Bill Text</h3>
          {loadingText ? (
            <div>Loading bill text...</div>
          ) : billText ? (
            <div dangerouslySetInnerHTML={{ __html: billText }} />
          ) : (
            <div>No bill text available.</div>
          )}
        </div>

        {bill.history?.length > 0 && (
          <div className="section-card">
            <h3 className="section-title">History</h3>
            <ul>
              {bill.history.map((e, i) => (
                <li key={i}><strong>{e.date}:</strong> {e.action}</li>
              ))}
            </ul>
          </div>
        )}

      
        
      </div>
      {showPopup && (
          <div className="summary-popup">
            <button onClick={() => summarizeText(selection)} disabled={loadingSummary}>
              {loadingSummary ? "Summarizing..." : "Click to generate summary"}
            </button>
            {summary && (
              <div>
                <strong>Summary:</strong> {summary}
              </div>
            )}
          </div>
        )}
    </div>
  );
}



export default BillDetailPage;