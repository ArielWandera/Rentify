export default function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Uppercase letter',       pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter',       pass: /[a-z]/.test(password) },
    { label: 'Number',                 pass: /[0-9]/.test(password) },
    { label: 'Symbol (!@#$...)',       pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const passed = checks.filter(c => c.pass).length;
  const strength = passed <= 2 ? 'Weak' : passed <= 4 ? 'Fair' : 'Strong';
  const barColor = passed <= 2 ? 'bg-red-500' : passed <= 4 ? 'bg-yellow-400' : 'bg-green-500';
  const textColor = passed <= 2 ? 'text-red-500' : passed <= 4 ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${(passed / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium w-12 text-right ${textColor}`}>{strength}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(c => (
          <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.pass ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <span>{c.pass ? '✓' : '○'}</span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
