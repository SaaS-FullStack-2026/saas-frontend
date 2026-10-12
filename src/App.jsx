import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StatusCheck from './pages/StatusCheck';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusCheck />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
