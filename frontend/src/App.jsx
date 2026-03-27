import { Toaster, toast } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';



function App() {

  return (
    <>
      <Toaster position='top-right' richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Signup />}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
