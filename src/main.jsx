import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/atkinson-hyperlegible-next/400.css'
import '@fontsource/atkinson-hyperlegible-next/700.css'
import './index.css'
import App from './App.jsx'
import DebugPoses from './components/DebugPoses.jsx'

const debugPoses = new URLSearchParams(window.location.search).get('debug') === 'poses'

createRoot(document.getElementById('root')).render(<StrictMode>{debugPoses ? <DebugPoses /> : <App />}</StrictMode>)
