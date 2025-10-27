// export function Card({ children, className = "" }) {
//   return <div className={`rounded-xl border p-4 shadow-sm bg-white ${className}`}>{children}</div>;
// }

// export function CardHeader({ children }) {
//   return <div className="mb-2 font-semibold text-gray-700">{children}</div>;
// }

// export function CardTitle({ children }) {
//   return <h3 className="text-lg font-bold">{children}</h3>;
// }

// export function CardContent({ children }) {
//   return <div>{children}</div>;
// }


export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border shadow-sm bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`mb-2 font-semibold text-gray-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-bold ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
