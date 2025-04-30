import { Game } from "@prisma/client";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString); // Converte a string para um objeto Date

  const day = String(date.getDate()).padStart(2, '0'); // Pega o dia e garante que terá 2 dígitos
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Pega o mês e garante que terá 2 dígitos (mês começa de 0)
  const year = date.getFullYear(); // Pega o ano

  return `${day}/${month}/${year}`; // Retorna no formato dd/mm/yyyy
};

// Exemplo de uso
const formattedDate = formatDate('2025-04-12T16:00:00Z');

export const dateInBrazilHours = (date: Date) => {
  const dateFormated = new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  } )
  return dateFormated
}
export const dateInBrazilDaysAndHours = (date: Date) => {
  const dateFormated = new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } )
  return dateFormated
}
export const dateInBrazilDays = (date: Date) => {
  const dateFormated = new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    
  } )
  return dateFormated
}

