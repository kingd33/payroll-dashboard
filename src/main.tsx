import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { PipelineProvider } from './context/PipelineContext.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PipelineProvider>
        <App />
      </PipelineProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
