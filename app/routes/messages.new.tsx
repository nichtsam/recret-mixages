import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Button } from "#app/components/ui/button";
import { Card, CardContent } from "#app/components/ui/card";
import { Input } from "#app/components/ui/input";
import { Textarea } from "#app/components/ui/textarea";
import { Form, json, redirect, useActionData } from "@remix-run/react";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { ErrorList } from "#app/components/form";
import { db } from "#app/utils/db.server";
import { messages } from "#drizzle/schema";

const INTENT_CONFIRM = "confrim";
const INTENT_CANCEL = "cancel";
const INTENT_CREATE = "create";

const schema = z.object({
  message: z.string(),
  code: z.string(),
});

export const meta: MetaFunction = () => {
  return [
    { title: "New Secret | Recret Mixages" },
    { name: "description", content: "Tell me a secret, I'll keep it for you." },
  ];
};

async function secretifyMessage(message: string) {
  const { id } = (
    await db.insert(messages).values({ message }).returning({ id: messages.id })
  )[0];

  return id;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(
      {
        ...submission.reply(),
        confirm: false,
      },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  switch (intent) {
    case INTENT_CONFIRM:
      return {
        ...submission.reply(),
        confirm: true,
      };
    case INTENT_CANCEL:
      return {
        ...submission.reply(),
        confirm: false,
      };
    case INTENT_CREATE: {
      const { message } = submission.value;
      const secretId = await secretifyMessage(message);
      return redirect(`/messages/${secretId}`);
    }
    default:
      throw new Response(`Invalid intent "${intent}"`, { status: 400 });
  }
};

export default function NewSecretMessage() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <div className="container max-w-lg">
      <Card>
        <CardContent className="flex flex-col gap-y-4">
          <Form
            method="post"
            {...getFormProps(form)}
            className="flex flex-col gap-y-2"
          >
            <div>
              <Textarea
                readOnly={lastResult?.confirm}
                {...getTextareaProps(fields.message)}
                placeholder="Type your secret message here."
                rows={4}
              />
              <ErrorList
                errorId={fields.message.errorId}
                errors={fields.message.errors}
              />
            </div>
            <div>
              <Input
                readOnly={lastResult?.confirm}
                {...getInputProps(fields.code, { type: "text" })}
                placeholder="Your secret code"
              />
              <ErrorList
                errorId={fields.code.errorId}
                errors={fields.code.errors}
              />
            </div>

            {lastResult?.confirm ? (
              <div className="flex gap-x-2">
                <Button
                  className="flex-1"
                  type="submit"
                  name="intent"
                  value={INTENT_CANCEL}
                  variant="secondary"
                >
                  cancel!
                </Button>
                <Button
                  className="flex-1"
                  type="submit"
                  name="intent"
                  value={INTENT_CREATE}
                >
                  create!
                </Button>
              </div>
            ) : (
              <Button type="submit" name="intent" value={INTENT_CONFIRM}>
                Shhh!
              </Button>
            )}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
