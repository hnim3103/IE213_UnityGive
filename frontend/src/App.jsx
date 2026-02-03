import {Toaster, toast} from 'sonner';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import Campaigns from './pages/Campaigns';
import About from './pages/About';
import FAQs from './pages/FAQs';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';


function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>

          <Route
            path="/"
            element={<HomePage/>}
          />

          <Route
            path="/campaigns"
            element={<Campaigns/>}
          />

          <Route
            path="/about"
            element={<About/>}
          />

          <Route
            path="/faqs"
            element={<FAQs/>}
          />

          <Route
            path="/login"
            element={<Login/>}
          />

          <Route
            path="*"
            element={<NotFound/>}
          />
        </Routes>

      </BrowserRouter>
    </>
  )
}

export default App
