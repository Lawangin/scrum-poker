import { BrowserRouter, Route, Routes } from 'react-router'
import { LandingPage } from './pages/LandingPage'
import { Room } from './pages/Room'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
