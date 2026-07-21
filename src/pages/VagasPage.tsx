import MicrositeVagas from "../components/MicrositeVagas";
import { usePortal } from "../portal/portalContext";

export default function VagasPage() {
  const { vagas, candidatos, appliedMap, handleApply } = usePortal();
  return (
    <MicrositeVagas
      vagas={vagas}
      candidatos={candidatos}
      onApply={handleApply}
      appliedMap={appliedMap}
    />
  );
}
