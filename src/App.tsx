import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import PortalLayout from "./components/PortalLayout";
import ConsolePage from "./pages/ConsolePage";
import ProcessosPage from "./pages/ProcessosPage";
import TriagemPage from "./pages/TriagemPage";
import EstudioPage from "./pages/EstudioPage";
import AdminPage from "./pages/AdminPage";
import VagasPage from "./pages/VagasPage";
import CandidaturasPage from "./pages/CandidaturasPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Internal portal — shared app-shell layout, top-level slugs */}
        <Route element={<PortalLayout />}>
          <Route path="/console" element={<ConsolePage />} />
          <Route path="/processos" element={<ProcessosPage />} />
          <Route path="/triagem" element={<TriagemPage />} />
          <Route path="/estudio" element={<EstudioPage />} />
          <Route path="/administracao" element={<AdminPage />} />
          <Route path="/vagas" element={<VagasPage />} />
          <Route path="/minhas-candidaturas" element={<CandidaturasPage />} />
        </Route>

        {/* Unknown routes fall back to the landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
