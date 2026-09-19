import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, Mail, LogIn } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/');
    },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    loginMutation.mutate({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    });
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">O</div>
          <h1>ORION</h1>
          <p>Maintenance Lite</p>
        </div>

        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={15} />
              <input
                name="email"
                type="email"
                required
                placeholder="supervisor@orion.com"
                defaultValue="supervisor@orion.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Lock size={15} />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                defaultValue="orion2026"
              />
            </div>
          </div>

          <button
            type="submit"
            className="primary login-submit"
            disabled={loginMutation.isPending}
          >
            <LogIn size={15} />
            {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-demo">
          <p><strong>Usuarios demo:</strong></p>
          <p>supervisor@orion.com / orion2026</p>
          <p>coordinador@orion.com / orion2026</p>
          <p>tecnico@orion.com / orion2026</p>
        </div>
      </div>
    </div>
  );
}