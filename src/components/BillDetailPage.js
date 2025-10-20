import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLegiScanProxy } from '../hooks/useLegiScanProxy';
import { fetchPrimaryBillText } from '../hooks/fetchPrimaryBillText';
import React from 'react';




function BillDetailPage() {


  //popup box code

  const [selection, setSelection] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

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
      const response = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setSummary(data.summary || "No summary returned");
    } catch (err) {
      console.error(err);
      setSummary("Failed to summarize");
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
      <button className="home-button" onClick={handleGoHome}>← Home</button>
      <p>Loading bill details...</p>
    </div>
  );
  
  if (error) return (
    <div className="bill-detail-page">
      <button className="home-button" onClick={handleGoHome}>← Home</button>
      <p>Error loading bill details: {error}</p>
    </div>
  );
  
  if (!data || !data.bill) return (
    <div className="bill-detail-page">
      <button className="home-button" onClick={handleGoHome}>← Home</button>
      <p>No bill details available</p>
    </div>
  );
  
  const bill = data.bill;
  //CSS styles
const colors = {
  mainBackground: "#d49999ff",
  background: "#ffffffff",
  surface: "#fbf9f9ff",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  accent: "#8a200dff",       
  accentLight: "#b62a17ff",  
  accentDark: "#882810ff",   
  transluscent: "#aa2b2bff",
};
//main background border

const mainBackground = {
  backgroundColor: colors.mainBackground,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  minHeight: "100vh",
  width: "100vh",
  padding: "40px 0",
  margin: 0,
  boxSizing: "border-box"
}
// Shared typography
const fontBase = { fontFamily: "'Inter', sans-serif" };

// Page container
const billDetailPageStyle = {
  ...fontBase,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  padding: "32px",
  lineHeight: 1.6,
  boxShadow: "0px 6x 50px rgba(0,0,0,0.1)", // optional: floating effect
  maxWidth: "900px",
  width: "90%",
  boxSizing: "border-box",
  borderRadius: "15px"
};

// Top button
const homeButtonStyle = {
  ...fontBase,
  backgroundColor: colors.accent,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px 18px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: 600,
  marginBottom: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  transition: "background 0.2s ease",
};

// Hover effect (React inline requires handling in onMouseEnter / onMouseLeave)
const homeButtonHover = {
  backgroundColor: colors.accentDark,
};

// Dropdown
const dropdownStyle = {
  ...fontBase,
  padding: "8px 12px",
  marginLeft: "px",
  marginBottom: "25px",
  border: `1px solid ${colors.textSecondary}`,
  borderRadius: "6px",
  fontSize: "14px",
  backgroundColor: "#fff",
};

// Content card
const billDetailContentStyle = {
  ...fontBase,
  backgroundColor: colors.background,
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  marginBottom: "40px"
};

// Headings
const headingStyle = {
  ...fontBase,
  fontWeight: 700,
  fontSize: "20px",
  color: colors.accentDark,
  borderBottom: `2px solid ${colors.accentLight}`,
  paddingBottom: "10px",
  marginBottom: "20px",
};

// Sections
const sectionStyle = {
  ...fontBase,
  marginBottom: "24px",
  textAlign: "left",
}

// Sponsor list
const sponsorListStyle = {
  ...fontBase,
  listStyleType: "disc",
  paddingLeft: "24px",
  color: colors.textSecondary,
};

// History items
const historyItemStyle = {
  ...fontBase,
  marginBottom: "8px",
  color: colors.accentDark,
};

//background bubbles
const backgroundBubble = {

  backgroundColor: colors.transluscent,
}

return (
  <div style = {mainBackground}>
    <div style={billDetailPageStyle}>
    
      {/* Top controls */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
        <button style={homeButtonStyle} onClick={handleGoHome}>
          Home
        </button>
        <select style={dropdownStyle} defaultValue="">
          <option value="" disabled>Select reading level</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div name="backgroundBubble">
      {/* Main content */}
      <div style={billDetailContentStyle}>
        <h2 style={headingStyle}>
          {bill.bill_number}: {bill.title}
        </h2>

        <div style={sectionStyle}>
          <p><strong>State:</strong> {bill.state}</p>
          <p><strong>Session:</strong> {bill.session.name}</p>
          <p><strong>Status:</strong> {bill.status}</p>
          <p><strong>Description:</strong> {bill.description || "No description available"}</p>
        </div>
      
        {bill.sponsors?.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={{ ...fontBase, fontWeight: 600, color: colors.accent }}>Sponsors</h3>
            <ul style={sponsorListStyle}>
              {bill.sponsors.map((sponsor) => (
                <li key={sponsor.people_id}>
                  {sponsor.name} ({sponsor.party})
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>

        <div style={billDetailContentStyle}>
          <h3 style={{ ...fontBase, fontWeight: 600, color: colors.accent }}>Full Bill Text</h3>
          {loadingText ? (
            <div>Loading bill text...</div>
          ) : billText ? (
            <div dangerouslySetInnerHTML={{ __html: billText }}  />
          ) : (
            <div>No bill text available.</div>
          )}
        </div>
      <div style={billDetailContentStyle}>
            {bill.history?.length > 0 && (
              <div style={sectionStyle}>
                <h3 style={{ ...fontBase, fontWeight: 600, color: colors.accent }}>History</h3>
                <ul>
                  {bill.history.map((event, index) => (
                    <li key={index} style={historyItemStyle}>
                      <strong>{event.date}:</strong> {event.action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>


      <div style={{ padding: "50px" }}>
        <p>
          Highlight some text in this paragraph, and a popup will appear with your selection.
        </p>

        {showPopup && (
          <div
            style={{
              ...fontBase,
              position: "fixed",
              top: "20px",
              right:"20px" ,
              backgroundColor: "#333",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "5px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              maxWidth:"40%"
              
            }}
          >
            <p><strong>Selected:</strong></p>
            <button style = {{height: "30px", width: "50px"}}onClick={()=> summarizeText(selection)} disabled={loadingSummary}></button>
            <div>
              {summary && (
                <div style={{ 
                  marginTop: "10px", 
                  backgroundColor: "#444", 
                  padding: "5px", 
                  borderRadius: "5px" ,
                }}>
                  <strong>Summary:</strong> {summary}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    
  </div>
);

}


export default BillDetailPage;