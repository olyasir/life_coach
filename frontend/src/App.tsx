import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import {
  clearToken,
  getMe,
  getToken,
  UnauthorizedError,
  type LockStatus,
  type SessionUser,
} from "./api";
import Chat from "./Chat";
import Login from "./Login";
import LockScreen from "./LockScreen";

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ?? "";

type AuthState =
  | { status: "loading" }
  | { status: "logged-out" }
  | { status: "logged-in"; user: SessionUser; lock: LockStatus };

export default function App() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  async function refresh() {
    if (!getToken()) {
      setState({ status: "logged-out" });
      return;
    }
    try {
      const me = await getMe();
      setState({ status: "logged-in", user: me.user, lock: me.lock });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        clearToken();
        setState({ status: "logged-out" });
      } else {
        console.error("getMe failed", err);
        setState({ status: "logged-out" });
      }
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui", color: "#b94a48" }}>
        <h2>Configuration error</h2>
        <p>
          <code>VITE_GOOGLE_CLIENT_ID</code> is not set. Add it to your
          environment and rebuild.
        </p>
      </div>
    );
  }

  let content: React.ReactNode;
  if (state.status === "loading") {
    content = (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontSize: 13,
        }}
      >
        loading…
      </div>
    );
  } else if (state.status === "logged-out") {
    content = <Login onLoggedIn={() => refresh()} />;
  } else if (state.lock.locked) {
    content = (
      <LockScreen user={state.user} lock={state.lock} onUnlocked={refresh} />
    );
  } else {
    content = <Chat />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {content}
    </GoogleOAuthProvider>
  );
}
