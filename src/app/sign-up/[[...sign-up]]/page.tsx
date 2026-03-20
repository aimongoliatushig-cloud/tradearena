import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { redirectToSignUp, userId } = await auth();
  const redirectUrl = typeof params.redirect_url === "string" ? params.redirect_url : "/dashboard";

  if (userId) {
    redirect(redirectUrl);
  }

  return redirectToSignUp({ returnBackUrl: redirectUrl });
}
