import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLegiScanProxy } from '../hooks/useLegiScanProxy';
import { fetchPrimaryBillText } from '../hooks/fetchPrimaryBillText';

function BillDetailPage() {
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
  
  return (
    <div className="bill-detail-page">
      <button className="home-button" onClick={handleGoHome}>← Home</button>
      
      <div className="bill-detail-content">
        <h2>{bill.bill_number}: {bill.title}</h2>
        
        <div className="bill-info">
          <p><strong>State:</strong> {bill.state}</p>
          <p><strong>Session:</strong> {bill.session.name}</p>
          <p><strong>Status:</strong> {bill.status}</p>
          <p><strong>Description:</strong> {bill.description || 'No description available'}</p>
        </div>
        
        {bill.sponsors && bill.sponsors.length > 0 && (
          <div className="bill-sponsors">
            <h3>Sponsors</h3>
            <ul>
              {bill.sponsors.map(sponsor => (
                <li key={sponsor.people_id}>
                  {sponsor.name} ({sponsor.party})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="bill-full-text">
          <h3>Full Bill Text</h3>
          {loadingText ? (
            <div className="bill-text-loading">Loading bill text...</div>
          ) : billText ? (
            <div className="bill-text-formatted" dangerouslySetInnerHTML={{ __html: billText }}>
            </div>
          ) : (
            <div className="no-text-available">
              No bill text available.
            </div>
          )}
        </div>
        
        {bill.history && bill.history.length > 0 && (
          <div className="bill-history">
            <h3>History</h3>
            <ul>
              {bill.history.map((event, index) => (
                <li key={index}>
                  <strong>{event.date}:</strong> {event.action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default BillDetailPage;