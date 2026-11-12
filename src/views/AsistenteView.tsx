import { PageHeader } from '../components/PageHeader.js';
import { ChatPanel } from '../chat/ChatPanel.js';

export function AsistenteView() {
  return (
    <div className="asistente">
      <PageHeader titulo="Asistente" />
      <div className="asistente__panel">
        <ChatPanel modo="pagina" />
      </div>
    </div>
  );
}
