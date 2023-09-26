import Link from "next/link";

// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default function Page() {
    return <main
    className="flex flex-col items-center justify-between p-24"
    >
        <h1>
        Hello, Dashboard Page!
        </h1>
        <Link href="/form">
            Go to Form
        </Link>
    </main>
}