export function Footer() {
  return (
    <footer className="w-full py-4 px-4 bg-dark-bg border-t border-dark-border">
      <div className="flex items-center justify-center gap-1 text-sm font-sans text-gray-400">
        <span>© 2026 • Built by</span>
        <a
          href="https://uminduisith.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center group transition-colors duration-200"
        >
          <img
            src="/Ulogo.png"
            alt="U"
            className="h-5 w-auto opacity-60 group-hover:opacity-100 transition-opacity duration-200 -mr-0.6 -translate-y-1"
          />
          <span className="group-hover:text-white transition-colors duration-200">
            mindu Isith
          </span>
        </a>
      </div>
    </footer>
  );
}
