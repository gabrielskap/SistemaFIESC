import PortalCandidato from "../components/PortalCandidato";
import { usePortal } from "../portal/portalContext";

export default function CandidaturasPage() {
  const { vagas, candidatos, appliedMap } = usePortal();
  return <PortalCandidato vagas={vagas} candidatos={candidatos} appliedMap={appliedMap} />;
}
