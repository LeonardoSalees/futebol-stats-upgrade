import Link from 'next/link';

const RoundCard = ({ round }: any) => {
  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">{round.name}</h2>
      <p className="text-gray-600">{new Date(round.date).toLocaleDateString()}</p>
      <Link href={`/round/${round.id}`}>
        <p className="text-blue-500 mt-2 inline-block">Ver detalhes</p>
      </Link>
    </div>
  );
};

export default RoundCard;