export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Cowat. Tous droits réservés.</span>
        <div className="flex gap-6">
          <span className="cursor-pointer transition-colors hover:text-foreground">
            Mentions légales
          </span>
          <span className="cursor-pointer transition-colors hover:text-foreground">
            Confidentialité
          </span>
        </div>
      </div>
    </footer>
  );
}
