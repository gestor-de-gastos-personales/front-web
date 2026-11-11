import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth.store.js';
import { Widget } from '../components/Widget.js';

export function PerfilView() {
  const usuario = useAuth((estado) => estado.usuario);
  const salir = useAuth((estado) => estado.salir);
  const navigate = useNavigate();

  const cerrar = () => {
    salir();
    navigate('/login');
  };

  return (
    <div className="grid">
      <Widget titulo="Perfil" tag={`#${usuario?.id ?? '—'}`} acento="blue" className="span-6">
        <dl className="mono" style={{ display: 'grid', gap: 10, margin: 0 }}>
          <div>
            <dt>Nombre</dt>
            <dd style={{ margin: 0, fontSize: 18 }}>{usuario?.nombre ?? '—'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd style={{ margin: 0, fontSize: 18 }}>{usuario?.email ?? '—'}</dd>
          </div>
          <div>
            <dt>Telegram</dt>
            <dd style={{ margin: 0, fontSize: 18 }}>
              {usuario?.telegramId ?? 'Sin vincular'}
            </dd>
          </div>
        </dl>

        <div style={{ marginTop: 18 }}>
          <button type="button" className="boton boton--peligro" onClick={cerrar}>
            Cerrar sesión
          </button>
        </div>
      </Widget>
    </div>
  );
}
