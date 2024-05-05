import { GeneralErrorBoundary } from "#app/components/error-boundary";
import { ErrorList } from "#app/components/form";
import { Button } from "#app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
import { Input } from "#app/components/ui/input";
import { Separator } from "#app/components/ui/separator";
import { db } from "#app/utils/db.server";
import { decrypt } from "#app/utils/encryption.server";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { z } from "zod";

const schema = z.object({
  code: z.string(),
});

export const loader = async ({
  request,
  params: { id },
}: LoaderFunctionArgs) => {
  if (!id) {
    throw Error("Secret ID is required");
  }

  const message = await db.query.messages.findFirst({
    where: (message, { eq }) => eq(message.id, id),
  });

  if (!message) {
    throw new Response("Not found", { status: 404 });
  }

  return json({
    id,
    secretUrl: request.url,
  });
};

export const action = async ({
  request,
  params: { id },
}: ActionFunctionArgs) => {
  if (!id) {
    throw Error("Secret ID is required");
  }

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply(), message: null },
      {
        status: submission.status === "error" ? 400 : 200,
      }
    );
  }

  const message = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.id, id),
  });

  if (!message) {
    throw new Response("Not found", { status: 404 });
  }

  const encrypted = message.message;
  const { code } = submission.value;

  let decrypted: string;
  try {
    decrypted = decrypt(encrypted, code);
  } catch {
    return json(
      {
        result: submission.reply({ fieldErrors: { code: ["Code is wrong"] } }),
        message: null,
      },
      { status: 401 }
    );
  }

  return json({
    result: submission.reply(),
    message: decrypted,
  });
};

export default function SecretMessage() {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  location.pathname;

  const actionData = useActionData<typeof action>();

  return (
    <div className="container max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Secret {data.id}</CardTitle>
          <CardDescription>
            Enter the secret code to unlock this message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            <span className="text-sm text-muted-foreground">
              Share the secret with this link:
            </span>
            <br />
            <span className="text-sm text-primary underline-offset-4 hover:underline">
              {data.secretUrl}
            </span>
          </p>

          <Separator className="mt-2 mb-6" />

          {actionData?.message ? (
            <Message message={actionData.message} />
          ) : (
            <UnlockForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Message({ message }: { message: string }) {
  return (
    <p>
      <span className="text-sm text-muted-foreground">The secret message:</span>
      <br />
      <span className="inline-block overflow-auto w-full">{message}</span>
    </p>
  );
}

function UnlockForm() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: actionData?.result,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <Form
      method="post"
      {...getFormProps(form)}
      className="flex flex-col gap-y-2"
    >
      <div>
        <Input
          {...getInputProps(fields.code, { type: "password" })}
          placeholder="Secret Code"
        />
        <ErrorList errorId={fields.code.errorId} errors={fields.code.errors} />
      </div>
      <Button type="submit">Open Secret Message</Button>
    </Form>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: NotFound,
      }}
    />
  );
}

function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl sm:text-4xl md:text-5xl">
          We can&apos;t find this secret
        </h1>
      </div>
      <Link to="/" className="flex items-center gap-2 self-start text-lg">
        Back to home
      </Link>
    </div>
  );
}
