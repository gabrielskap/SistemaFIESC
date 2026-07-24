import ConsoleDashboard from "../components/ConsoleDashboard";
import { usePortal } from "../portal/portalContext";

export default function ConsolePage() {
  const { vagas, candidatos, appliedMap } = usePortal();
  return <ConsoleDashboard vagas={vagas} candidatosCount={candidatos.length} appliedMap={appliedMap} />;
}
