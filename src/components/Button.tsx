interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'ghost' | 'score';
  disabled?: boolean;
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-slate-200 text-slate-800 active:bg-slate-300',
  primary: 'bg-blue-600 text-white active:bg-blue-700',
  success: 'bg-emerald-600 text-white active:bg-emerald-700',
  danger: 'bg-red-500 text-white active:bg-red-600',
  ghost: 'bg-transparent text-slate-600 active:bg-slate-100',
  score: 'bg-white border-2 border-slate-300 text-slate-800 active:border-blue-500 active:bg-blue-50',
};

export default function Button({ children, onClick, variant = 'default', disabled, className = '' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-40 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
