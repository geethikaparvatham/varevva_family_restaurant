import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomDock from './components/MobileBottomDock';
import FloatingCartBar from './components/FloatingCartBar';
import CheckoutModal from './components/CheckoutModal';
import OwnerLoginModal from './components/OwnerLoginModal';
import Home from './pages/Home';
import About from './pages/About';
import Specials from './pages/Specials';
import Menu from './pages/Menu';
import Ambience from './pages/Ambience';
import Contact from './pages/Contact';
import ItemDetails from './pages/ItemDetails';
import Verify from './pages/Verify';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import './index.css';

function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/specials" element={<Specials />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/ambience" element={<Ambience />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/verify" element={<Verify />} />
              </Routes>
            </div>
            <FloatingCartBar />
            <MobileBottomDock />
            <CheckoutModal />
            <OwnerLoginModal />
          </div>
        </Router>
      </CartProvider>
    </AdminProvider>
  );
}

export default App;
