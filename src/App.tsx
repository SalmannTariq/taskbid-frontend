import { useEffect, useState } from "react";
import { currentUser } from "./api";
import { AccountPage } from "./pages/AccountPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { navigate, replace, usePath } from "./router";
import type { SessionUser } from "../types/user.types";

export default function App() {
  const path = usePath();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    currentUser()
      .then((session) => {
        if (!cancelled) setUser(session);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (user && (path === "/signin" || path === "/signup")) {
      replace("/");
      return;
    }
    if (!user && path !== "/signin" && path !== "/signup") {
      replace("/signin");
    }
  }, [ready, user, path]);

  function onSuccess(session: SessionUser) {
    setUser(session);
    navigate("/");
  }

  let page = <p className="muted">Loading…</p>;
  if (ready && user && path === "/") {
    page = (
      <AccountPage
        user={user}
        onSignOut={() => {
          setUser(null);
          navigate("/signin");
        }}
      />
    );
  } else if (ready && !user && path === "/signin") {
    page = <SignInPage onSuccess={onSuccess} />;
  } else if (ready && !user && path === "/signup") {
    page = <SignUpPage onSuccess={onSuccess} />;
  }

  return <main className="page">{page}</main>;
}
