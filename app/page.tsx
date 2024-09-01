import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/bookings");
  return (
    <main className="min-h-screen space-y-8 bg-sky-900 p-24 text-center">
      <h1 className="bg-gradient-to-r from-white to-white bg-clip-text text-8xl font-black text-transparent">
        Promo Trend Travel <br /> Internal Booking System
      </h1>
      <form
        action={async () => {
          "use server";
          const supabase = createClient();

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo:
                "https://internal-booking-system.vercel.app/api/auth/callback",
              queryParams: {
                next: "bookings",
              },
            },
          });
          if (error) throw error;
          revalidatePath("/");
          if (data) redirect(data.url);
        }}
      >
        <Button
          type="submit"
          className="h-14 gap-x-2 rounded border-2 border-white text-xl font-semibold"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.57465 8.76167C4.54532 6.82879 6.03442 5.20393 7.87548 4.06872C9.71655 2.9335 11.8371 2.33266 14 2.33334C17.1441 2.33334 19.7855 3.4895 21.805 5.3725L18.4601 8.7185C17.2503 7.56234 15.7126 6.97317 14 6.97317C10.9608 6.97317 8.38831 9.0265 7.47248 11.7833C7.23915 12.4833 7.10615 13.23 7.10615 14C7.10615 14.77 7.23915 15.5167 7.47248 16.2167C8.38948 18.9747 10.9608 21.0268 14 21.0268C15.5691 21.0268 16.905 20.6127 17.9503 19.9127C18.5563 19.5137 19.0751 18.9959 19.4754 18.3907C19.8756 17.7856 20.149 17.1055 20.279 16.3917H14V11.879H24.9876C25.1253 12.642 25.2 13.4377 25.2 14.2648C25.2 17.8185 23.9283 20.8098 21.721 22.8398C19.7913 24.6225 17.15 25.6667 14 25.6667C12.4677 25.6673 10.9504 25.3659 9.53462 24.7798C8.11887 24.1938 6.83251 23.3344 5.74903 22.2509C4.66556 21.1675 3.80622 19.8811 3.22014 18.4654C2.63405 17.0496 2.3327 15.5323 2.33331 14C2.33331 12.117 2.78365 10.3367 3.57465 8.76167Z"
              fill="white"
            />
          </svg>
          Sign in with Google
        </Button>
      </form>
    </main>
  );
}
