import { Button } from "#app/components/ui/button";
import { Card, CardContent } from "#app/components/ui/card";
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="container max-w-lg">
      <Card>
        <CardContent className="flex flex-col gap-y-4">
          <Button asChild>
            <Link to={"messages/new"}>New Secret Message</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
