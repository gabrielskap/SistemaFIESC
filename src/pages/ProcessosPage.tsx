import KanbanBoard from "../components/KanbanBoard";
import { usePortal } from "../portal/portalContext";

export default function ProcessosPage() {
  const { vagas, candidatos } = usePortal();
  return <KanbanBoard vagas={vagas} candidatos={candidatos} />;
}
