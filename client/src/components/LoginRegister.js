import { useState } from 'react';

const LoginRegister = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const endpoint = isRegistering ? 'register' : 'login';

    try {
      const res = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error del servidor');

      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-input"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              className="login-input password-field"
              type='password'
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegistering && (
            <div className="password-container">
              <input
                className="login-input password-field"
                type='password'
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="login-button">
            {isRegistering ? 'Registrar' : 'Entrar'}
          </button>
        </form>

        <p
          className="toggle-text"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
        >
          {isRegistering
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿No tienes cuenta? Regístrate'}
        </p>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
};

export default LoginRegister;
