export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="border rounded-xl px-4 py-2 w-full"
      {...props}
    />
  )
}