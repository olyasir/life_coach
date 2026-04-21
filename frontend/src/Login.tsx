import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { authWithGoogle, setToken, type SessionUser } from "./api";

interface Props {
  onLoggedIn: (user: SessionUser) => void;
}

export default function Login({ onLoggedIn }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#faf7f0",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "white",
          padding: "40px 32px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0 0 8px", color: "#2a5d4e", fontSize: 24 }}>
          Personal coach
        </h1>
        <p
          style={{
            margin: "0 0 28px",
            color: "#666",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          A 12-session coaching journey. One hour a week. Sign in to begin or
          continue your practice.
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const idToken = credentialResponse.credential;
              if (!idToken) {
                setError("No credential returned from Google");
                return;
              }
              setBusy(true);
              setError(null);
              try {
                const { token, user } = await authWithGoogle(idToken);
                setToken(token);
                onLoggedIn(user);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
            onError={() => setError("Google sign-in failed")}
          />
        </div>

        {busy && (
          <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
            signing you in…
          </p>
        )}
        {error && (
          <p style={{ marginTop: 16, color: "#b94a48", fontSize: 13 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
