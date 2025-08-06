import { useLegiScanProxy } from '../hooks/useLegiScanProxy';

function BillDetail({ billId }) {
  const { data, loading, error } = useLegiScanProxy(`bill/${billId}`);
  
  if (loading) return <p>Loading bill details...</p>;
  if (error) return <p>Error loading bill details: {error}</p>;
  if (!data || !data.bill) return <p>No bill details available</p>;
  
  const bill = data.bill;
  
  return (
    <div className="bill-detail">
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
      
      {bill.texts && bill.texts.length > 0 && (
        <div className="bill-texts">
          <h3>Bill Texts</h3>
          <ul>
            {bill.texts.map(text => (
              <li key={text.doc_id}>
                <a 
                  href={text.state_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {text.type} ({text.date})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
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
  );
}

export default BillDetail;