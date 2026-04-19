export function ModulePlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <p className="mt-2 text-slate-400">Ovaj modul će biti implementiran u narednom tiketu.</p>
    </div>
  );
}
