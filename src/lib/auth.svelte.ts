import { pb } from "./pocketbase";
import type { UsersResponse } from "./pocketbase-typegen";

interface AuthState {
  isLoggedIn: boolean;
  user: UsersResponse | null;
}

function createAuthState(): AuthState {
  let isLoggedIn = $state(pb.authStore.isValid && !pb.authStore.isSuperuser);
  let user = $state<UsersResponse | null>(
    pb.authStore.isValid && !pb.authStore.isSuperuser
      ? (pb.authStore.record as UsersResponse)
      : null,
  );

  // Listen for auth changes
  pb.authStore.onChange((_, record) => {
    isLoggedIn = pb.authStore.isValid && !pb.authStore.isSuperuser;
    user = isLoggedIn ? (record as UsersResponse) : null;
  });

  return {
    get isLoggedIn() {
      return isLoggedIn;
    },
    get user() {
      return user;
    },
  };
}

export const auth = createAuthState();

export async function login(email: string, password: string): Promise<void> {
  await pb.collection("users").authWithPassword(email, password);
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await pb.collection("users").create({
    name,
    email,
    password,
    passwordConfirm: password,
  });
  // Auto-login after registration
  await login(email, password);
}

export function logout(): void {
  pb.authStore.clear();
}
