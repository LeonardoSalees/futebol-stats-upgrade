// Skeleton base para cards
export function CardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="h-7 w-40 bg-yellow-400/20 rounded" />
        <div className="h-7 w-32 bg-yellow-400/20 rounded" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between w-full">
          <div className="h-6 w-48 bg-yellow-400/20 rounded" />
          <div className="h-6 w-24 bg-yellow-400/20 rounded" />
        </div>
        <div className="h-6 w-32 bg-green-400/20 rounded" />
      </div>
    </div>
  );
}

// Skeleton para listas
export function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-yellow-400/20 rounded mb-4" />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl shadow-lg p-5 animate-pulse"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <div className="h-7 w-40 bg-yellow-400/20 rounded" />
            <div className="h-7 w-32 bg-yellow-400/20 rounded" />
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex justify-between w-full">
                <div className="h-6 w-48 bg-blue-100/20 rounded" />
                <div className="h-6 w-24 bg-blue-100/20 rounded" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="h-10 w-32 bg-blue-500/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para tabelas
export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-yellow-400/20 rounded mb-4" />
      <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl shadow-lg p-5 animate-pulse">
        <div className="space-y-4">
          {/* Cabeçalho da tabela */}
          <div className="flex justify-between w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-24 bg-yellow-400/20 rounded" />
            ))}
          </div>
          {/* Linhas da tabela */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between w-full">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-6 w-24 bg-blue-100/20 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton para formulários
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-yellow-400/20 rounded mb-4" />
      <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 w-32 bg-yellow-400/20 rounded" />
              <div className="h-10 w-full bg-blue-100/20 rounded" />
            </div>
          ))}
          <div className="h-10 w-32 bg-blue-500/20 rounded" />
        </div>
      </div>
    </div>
  );
}

// Container padrão para skeletons
export function SkeletonContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 mt-8">
      {children}
    </div>
  );
} 