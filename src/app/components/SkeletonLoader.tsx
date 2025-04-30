"use client";

export const SkeletonLoader = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton para navegação */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-3 h-full shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-gray-600 rounded-full mb-2"></div>
              <div className="h-4 w-16 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton para rodada ativa */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-700 p-2">
          <div className="h-5 w-24 bg-gray-600 rounded"></div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
              <div className="h-4 w-24 bg-gray-600 rounded"></div>
            </div>
            <div className="h-4 w-16 bg-gray-600 rounded-full"></div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-gray-600 rounded"></div>
              <div className="flex items-center">
                <div className="h-6 w-6 bg-gray-600 rounded mx-1"></div>
                <div className="h-6 w-6 bg-gray-600 rounded mx-1"></div>
              </div>
              <div className="h-4 w-20 bg-gray-600 rounded"></div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="h-6 w-24 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Skeleton para histórico de partidas */}
      <div>
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-gray-600 rounded mr-2"></div>
          <div className="h-5 w-36 bg-gray-600 rounded"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-700 p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-600 rounded-full mr-2"></div>
                    <div className="h-4 w-24 bg-gray-600 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-600 rounded-full"></div>
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="bg-gray-700 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-20 bg-gray-600 rounded"></div>
                        <div className="flex items-center">
                          <div className="h-5 w-5 bg-gray-600 rounded mx-1"></div>
                          <div className="h-5 w-5 bg-gray-600 rounded mx-1"></div>
                        </div>
                        <div className="h-4 w-20 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3">
                  <div className="h-8 w-24 bg-gray-600 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 