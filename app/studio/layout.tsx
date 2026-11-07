export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="sr-only">T3x Studio. Make a game and share the link.</div>
      {children}
    </div>
  );
}
