import { Table } from "@repo/supabase";
import { Button, Separator } from "@repo/ui";
import { trpc } from "~/lib/trpc";
import { DigestListing, DigestTable } from "./DigestTable";
import { DigestFormModal } from "./DigestFormModal";
import { IconCirclePlus } from "@tabler/icons-react";
import { Link } from "@remix-run/react";

type DigestsViewProps = {
  initialData: Table<"digests">[];
};
export function DigestsView({ initialData }: DigestsViewProps) {
  const { data: digests } = trpc.digests.all.useQuery(undefined, {
    initialData: initialData,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-semibold font-serif">Contacts</h2>
          <p className="text-muted-foreground">
            Manage who gets your daily digest notifications.
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-auto">
          <Button variant="outline" asChild>
            <Link to="new">
              <IconCirclePlus className="mr-2" size={20} />
              Add Contact
            </Link>
          </Button>
        </div>
      </header>
      <Separator />
      <DigestTable digests={digests} />
      <DigestListing digests={digests} />
    </div>
  );
}
