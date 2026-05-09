"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/app/lib/auth-client";

export async function signUp(
  email: string,
  password: string,
  name: string,
  callbackUrl: string,
  router: ReturnType<typeof useRouter>,
  image?: string,
) {
  const { data, error } = await authClient.signUp.email(
    {
      email,
      password,
      name,
      image,
      callbackURL: callbackUrl,
    },
    {
      onRequest: () => {
        // show loading
      },
      onSuccess: () => {
        router.push(callbackUrl);
      },
      onError: (ctx) => {
        alert(ctx.error.message);
      },
    },
  );
  return { data, error };
}

export async function signIn(
  email: string,
  password: string,
  callbackUrl: string,
  rememberMe: boolean,
) {
  const { data, error } = await authClient.signIn.email(
    {
      email,
      password,
      callbackURL: callbackUrl,
      /**
       * @default true
       */
      rememberMe: rememberMe,
    },
    {
      //callbacks
    },
  );
  return { data, error };
}

export async function signOut(router: ReturnType<typeof useRouter>) {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/");
      },
    },
  });
}
