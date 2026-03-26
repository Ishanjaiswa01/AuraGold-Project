import { useState } from 'react'; // Import useState
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  // State for the prediction timeframe (default: 7 days)
  const [timeframe, setTimeframe] = useState(7);

  return (
    <div className="app-container">
      {/* Pass state and setter to Sidebar */}
      <Sidebar timeframe={timeframe} setTimeframe={setTimeframe} />
      
      {/* Pass state to Dashboard */}
      <Dashboard timeframe={timeframe} />
    </div>
  );
}

export default App;