import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";

export default function App() {
  return (
    <div className="layout">
      <header className="top-header">
        <Link to="/" className="nav-link">
          <b>Home</b>
        </Link>
        <Link to="/create" className="nav-link">
          Création
        </Link>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </div>
  );
}
