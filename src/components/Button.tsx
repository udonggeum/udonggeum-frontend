// Types/Interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

// Component
export default function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  // Constants
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200';
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  // Rendering
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  );
}
