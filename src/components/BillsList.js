import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLegiScanProxy } from '../hooks/useLegiScanProxy';

function BillsList() {
  const [selectedState, setSelectedState] = useState('IL');
  const navigate = useNavigate();
  const { data, loading, error } = useLegiScanProxy('bills', { state: selectedState });
  
  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
  };
  
  const handleBillClick = (billId) => {
    navigate(`/bill/${billId}`);
  };
  

  
  // Function to get status text
  const getStatusText = (status) => {
    switch(status) {
      case 1: return 'Active';
      case 2: return 'Passed';
      case 3: return 'Vetoed';
      case 4: return 'Failed';
      case 5: return 'Withdrawn';
      case 6: return 'Carried Over';
      default: return `Status ${status}`;
    }
  };
  
  // Function to render bills from single state
  const renderSingleStateBills = () => {
    if (!data.masterlist || Object.keys(data.masterlist).length === 0) return <p>No bills found for {selectedState}</p>;
    return (
      <ul className="bills-list-items">
        {Object.values(data.masterlist).map(bill => (
          <li 
            key={bill.bill_id} 
            onClick={() => handleBillClick(bill.bill_id)}
            className="bill-item-clickable"
          >
            <strong>{bill.number}</strong>: {bill.title}
            <div className="bill-status-info">
              <span className={`status-${bill.status}`}>
                {getStatusText(bill.status)}
              </span>
              {(bill.status_date || bill.last_action_date) && (
                <span className="last-action">
                  Last Action: {bill.status_date || bill.last_action_date}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return null;
  
  // States dropdown options - All 50 US States, DC, and US Congress
  const states = [
    { value: 'US', label: 'US Congress' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'DC', label: 'Washington D.C.' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];
  
  return (
    <div className="bills-container">
      <div className="bills-list">
        <div className="view-controls">
          <div className="state-selector">
            <label htmlFor="state-select">Select State: </label>
            <select 
              id="state-select"
              value={selectedState} 
              onChange={handleStateChange}
            >
              {states.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="bills-content">
          {renderSingleStateBills()}
        </div>
      </div>
    </div>
  );
}

export default BillsList;