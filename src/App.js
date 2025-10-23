import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import BillsList from './components/BillsList';
import BillDetailPage from './components/BillDetailPage';
import Header from './components/Header';
import About from './components/About';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<BillsList />} />
            <Route path="/bill/:billId" element={<BillDetailPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
