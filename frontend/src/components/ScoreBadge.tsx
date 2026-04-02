export function ScoreBadge({ score }: { score?: number }) {
  if (score === undefined) {
    return <span className="pill muted-pill">Unscored</span>;
  }
  const tone = score >= 75 ? "good" : score >= 50 ? "warn" : "bad";
  return <span className={`pill ${tone}`}>{Math.round(score)}</span>;
}
