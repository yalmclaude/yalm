// Renders text as masked words so the motion system can slide each one up into view.
// Splitting happens at render time (not by mutating the DOM later), so React stays in
// charge of these nodes. Place it inside an element marked `data-split`.
export function SplitWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <span className="sw">
            <span className="sw-inner">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
