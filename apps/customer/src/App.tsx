// ═══════════════════════════════════════════
// DineSmart — Customer App Component
// ═══════════════════════════════════════════

import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import OrderTracking from './pages/OrderTracking';
import OfflinePage from './pages/OfflinePage';

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/track/:sessionId" element={<OrderTracking />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen p-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-brand-500 mb-4">DineSmart</h1>
              <p className="text-slate-400 text-lg">Scan a QR code at your table to start ordering</p>
              <div className="mt-8 w-40 h-40 mx-auto rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center">
                <span className="text-6xl">📱</span>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
