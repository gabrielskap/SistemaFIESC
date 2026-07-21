import ConsoleDashboard from "../components/ConsoleDashboard";
import { usePortal } from "../portal/portalContext";

export default function ConsolePage() {
  const { vagas, candidatos } = usePortal();
  return <ConsoleDashboard vagas={vagas} candidatosCount={candidatos.length} />;
}
