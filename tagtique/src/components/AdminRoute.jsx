import React, { Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAdminConfigured, isAdminSessionActive, startAdminSession } from '../auth/adminSession';

const AdminPage = React.lazy(() => import('../pages/AdminPage'));

function AdminGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(() => isAdminSessionActive());
  const configured = isAdminConfigured();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!configured) {
      setError('Admin access is not configured.');
      return;
    }
    if (!startAdminSession(password)) {
      setError('That password is not valid.');
      setPassword('');
      return;
    }
    setUnlocked(true);
  };

  if (unlocked) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FDF7EC] text-[#2E1B10] flex items-center justify-center font-manrope">
            Loading admin…
          </div>
        }
      >
        <AdminPage onLogout={() => setUnlocked(false)} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7EC] text-[#2E1B10] flex items-center justify-center p-6 font-manrope">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#FFFDF8] border border-[#EADFCB] rounded-3xl p-8 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <h1 className="font-baloo font-extrabold text-3xl">Admin access</h1>
          <p className="text-sm text-[#5C452F]">
            {configured
              ? 'Enter the admin password to open the operations console.'
              : 'Set VITE_ADMIN_PASSWORD in .env.local, then restart the dev server.'}
          </p>
        </div>
        <label className="flex flex-col gap-1.5 text-xs font-bold">
          Password
          <input
            type="password"
            name="admin-password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
            disabled={!configured}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADFCB] bg-[#FDF7EC] text-sm font-semibold outline-none focus:border-[#F5B21F] disabled:opacity-60"
          />
        </label>
        {error && (
          <p className="text-sm font-semibold text-red-800" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!configured}
          className="amber-gradient-btn py-3 rounded-full text-sm font-extrabold text-[#2E1B10] disabled:opacity-50"
        >
          Unlock admin
        </button>
        <Link to="/" className="text-center text-sm font-semibold text-[#8A5A2B] hover:text-[#2E1B10]">
          Return to store
        </Link>
      </form>
    </div>
  );
}

export default function AdminRoute() {
  return <AdminGate />;
}
