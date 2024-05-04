import { Badge } from "./ui/badge";

export type Errors = (string | null | undefined)[] | null | undefined;
export interface ErrorListProps {
  errors?: Errors;
  errorId?: string;
}

export const ErrorList = ({ errorId, errors }: ErrorListProps) => {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;

  return (
    <ul id={errorId} className="text-de my-2 flex flex-col gap-2">
      {errors!.map((error) => (
        <li key={error}>
          <Badge variant="destructive">{error}</Badge>
        </li>
      ))}
    </ul>
  );
};
