export default function Footer() {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || '#';
  const vercelProjectUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_URL || '#';
  return (
    <footer className="mt-16 bg-gray-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 flex items-center justify-between">
        <p className="text-sm">© {new Date().getFullYear()} สุขภาพพระสงฆ์</p>
        <div className="flex items-center gap-4">
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-4 hover:text-white">
            GitHub
          </a>
          <a href={vercelProjectUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-4 hover:text-white">
            Vercel
          </a>
        </div>
      </div>
    </footer>
  );
}


