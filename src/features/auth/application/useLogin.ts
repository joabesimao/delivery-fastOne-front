import { useState } from "react";
import { session } from "@/shared/session/session";
import {
  LOGIN_MESSAGES,
  loginErrorMessage,
  toLoginEmail,
  toSessionData,
  validateCredentials,
  type LoginCredentials,
} from "../domain/credentials";
import { authRepository } from "../data/authRepository";

export const useLogin = (onAuthenticated: () => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (credentials: LoginCredentials) => {
    setError("");
    const invalid = validateCredentials(credentials);
    if (invalid) {
      setError(invalid);
      return;
    }

    setLoading(true);
    try {
      const result = await authRepository.login(
        toLoginEmail(credentials.login),
        credentials.password,
      );
      if (!result.accessToken) {
        setError(LOGIN_MESSAGES.rejected);
        return;
      }
      session.start(
        toSessionData(credentials.login.trim(), {
          ...result,
          accessToken: result.accessToken,
        }),
      );
      onAuthenticated();
    } catch (caught) {
      setError(loginErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
