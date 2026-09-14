"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getApiUrl } from "../api-config";

export default function TelegramLogin({ botUsername }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!botUsername) return;

    // Define the global callback expected by the Telegram widget
    window.onTelegramAuth = async function (user) {
      try {
        setError(null);
        setLoading(true);
        // Send the entire Telegram payload to server for verification
        const res = await axios.post(getApiUrl('/api/auth/telegram'), user, { headers: { 'Content-Type': 'application/json' } });
        if (res?.data) {
          // store tokens locally - the app's auth flow may differ; storing for client-side use
          try {
            if (res.data.accessToken) localStorage.setItem('accessToken', res.data.accessToken);
            if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
          } catch (e) {
            // ignore storage errors
          }
          // redirect to dashboard or refresh
          window.location.href = '/dashboard';
        } else {
          setError('Unexpected response from server');
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Telegram login failed');
      } finally {
        setLoading(false);
      }
    };

    // Create the Telegram widget script inside the container
    const script = document.createElement('script');
    script.setAttribute('async', '');
    script.src = 'https://telegram.org/js/telegram-widget.js?15';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-on-login', 'onTelegramAuth');

    const container = document.getElementById('telegram-login-container');
    if (container) {
      // clear previous
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      // cleanup global callback
      try {
        delete window.onTelegramAuth;
      } catch (e) {}
      if (container) container.innerHTML = '';
    };
  }, [botUsername]);

  return (
    <div>
      <div id="telegram-login-container" />
      {loading && <div className="mt-2 text-sm text-slate-400">Signing in with Telegram...</div>}
      {error && <div className="mt-2 text-sm text-rose-400">{error}</div>}
    </div>
  );
}
