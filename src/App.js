import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import BillsList from './components/BillsList';
import BillDetailPage from './components/BillDetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<BillsList />} />
            <Route path="/bill/:billId" element={<BillDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
