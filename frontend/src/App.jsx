import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';

function App() {
  return (
    <>
      <Toaster position='top-right' richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/campaigns" element={<Campaigns />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
