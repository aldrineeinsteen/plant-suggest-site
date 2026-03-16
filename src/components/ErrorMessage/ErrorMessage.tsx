interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-300" role="alert">
      <strong className="font-semibold">Something went wrong: </strong>
      {message}
    </div>
  );
}
