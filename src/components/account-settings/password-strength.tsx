const LABELS = ["弱い", "やや弱い", "普通", "強い", "非常に強い"] as const;
const COLORS = ["#fc8181", "#f6ad55", "#f6e05e", "#68d391", "#38a169"] as const;

function scorePassword(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);

  return (
    <div>
      <div className="mb-1 flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-1 flex-1 rounded-full bg-border transition-all duration-300"
            style={{
              backgroundColor: index < score ? COLORS[score] : undefined,
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: COLORS[score] }}>
        パスワード強度: {LABELS[score]}
      </p>
    </div>
  );
}
