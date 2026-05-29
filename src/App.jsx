import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CreatePoll from './pages/CreatePoll.jsx'
import PollView from './pages/PollView.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/poll/:id" element={<PollView />} />
      </Routes>
    </BrowserRouter>
  )
}
