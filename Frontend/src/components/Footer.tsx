export function Footer() {
  return (
    <footer className="w-full py-2 px-3 bg-dark-bg border-t border-dark-border">
      <div className="flex items-center justify-center gap-0.5 text-xs font-sans text-gray-500">
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
            className="h-3.5 w-auto opacity-50 group-hover:opacity-100 transition-opacity duration-200 -mr-0.5 -translate-y-0.5"
          />
          <span className="group-hover:text-white transition-colors duration-200">
            mindu Isith
          </span>
        </a>
      </div>
    </footer>
  );
}
