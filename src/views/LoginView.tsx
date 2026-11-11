import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth.store.js';
import { Logo } from '../components/Logo.js';

export function LoginView() {
  const login = useAuth((estado) => estado.login);
  const error = useAuth((estado) => estado.error);
  const limpiarError = useAuth((estado) => estado.limpiarError);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    limpiarError();
    setEnviando(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/');
    } catch {
      // El error queda en el store y se muestra abajo.
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__caja">
        <div className="brand" style={{ marginBottom: 10 }}>
          <Logo size={46} />
          <span className="brand__name">mangos</span>
        </div>
        <h1 className="auth__titulo">Entrá a tus gastos</h1>
        <p className="mono">Tu registro personal, sin vueltas.</p>

        {error ? (
          <p className="alerta" role="alert">
            {error}
          </p>
        ) : null}

        <form className="auth__form" onSubmit={enviar}>
          <label className="campo">
            <span className="campo__label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="campo">
            <span className="campo__label">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="boton boton--primario" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: 16 }} className="mono">
          ¿No tenés cuenta? <Link to="/register">Crear una</Link>
        </p>
      </div>
    </div>
  );
}
