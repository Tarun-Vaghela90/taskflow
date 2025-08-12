import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'antd/dist/reset.css'; 
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';   // REQUIRED for AntD v5
import { store } from './Redux/store'
import { Provider } from 'react-redux'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './shared/hooks/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
          <ThemeProvider>

    <Provider store={store}>
      
    <ToastContainer position="top-right" autoClose={3000} />
    <App />
    </Provider>
          </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
