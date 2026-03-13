interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      <strong className="font-semibold">Something went wrong: </strong>
      {message}
    </div>
  );
}
