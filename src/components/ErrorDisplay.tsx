import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";
import { ApiError } from "@/app/types";

interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <AlertCircle className="w-5 h-5" />
        <span className="font-semibold">Erro</span>
      </div>
      <p className="text-red-600 mb-4">{error.message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          Tentar Novamente
        </Button>
      )}
    </div>
  );
} 