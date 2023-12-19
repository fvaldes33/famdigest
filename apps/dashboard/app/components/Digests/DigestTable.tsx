import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import type { Table as DbTable } from "@repo/supabase";
import { IconCheck, IconDotsVertical, IconX } from "@tabler/icons-react";
import { DigestFormModal } from "./DigestFormModal";
import { convertToLocal, fromNow } from "~/lib/dates";
import { trpc } from "~/lib/trpc";
import { useState } from "react";
import { Link } from "@remix-run/react";

type DigestTableProps = {
  digests: DbTable<"digests">[];
};
export function DigestTable({ digests }: DigestTableProps) {
  return (
    <div className="hidden lg:block bg-background rounded-lg border">
      <Table className="overflow-x-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Opt-In</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {digests.length > 0 ? (
            <>
              {digests.map((digest) => (
                <DigestTableRow key={digest.id} digest={digest} />
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center">
                <p className="text-lg font-medium tracking-tight mb-3">
                  Create your first Digest
                </p>
                <DigestFormModal>
                  <Button size="sm">Get Started</Button>
                </DigestFormModal>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function DigestListing({ digests }: DigestTableProps) {
  return (
    <div className="block lg:hidden bg-background rounded-lg border">
      {digests.length > 0 ? (
        <>
          {digests.map((digest) => (
            <DigestListingRow key={digest.id} digest={digest} />
          ))}
        </>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-medium tracking-tight mb-3">
            Create your first Digest
          </p>
          <DigestFormModal>
            <Button size="sm">Get Started</Button>
          </DigestFormModal>
        </div>
      )}
    </div>
  );
}

function DigestTableRow({ digest }: { digest: DbTable<"digests"> }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const utils = trpc.useUtils();
  const remove = trpc.digests.remove.useMutation({
    onSuccess() {
      utils.digests.all.invalidate();
    },
  });

  return (
    <>
      <TableRow>
        <TableCell>
          <Link to={`/contacts/${digest.id}`}>
            <p className="font-medium">{digest.full_name}</p>
            <p className="text-sm">{digest.phone}</p>
          </Link>
        </TableCell>
        <TableCell>
          {convertToLocal(digest.notify_on).format("hh:mm A")}
        </TableCell>
        <TableCell>{digest.opt_in ? <IconCheck /> : <IconX />}</TableCell>
        <TableCell>{digest.enabled ? <IconCheck /> : <IconX />}</TableCell>
        <TableCell>{fromNow(digest.updated_at)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu
            onOpenChange={() => {
              setConfirm(false);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost">
                <IconDotsVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link to={`/contacts/${digest.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpen(true)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer bg-destructive text-destructive-foreground focus:bg-destructive/50 focus:text-destructive-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm) {
                    remove.mutate(digest.id);
                  } else {
                    setConfirm(true);
                  }
                }}
              >
                {remove.isLoading
                  ? "Deleting..."
                  : confirm
                    ? "Are you sure?"
                    : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <DigestFormModal digest={digest} open={open} onOpenChange={setOpen} />
    </>
  );
}

function DigestListingRow({ digest }: { digest: DbTable<"digests"> }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const utils = trpc.useUtils();
  const remove = trpc.digests.remove.useMutation({
    onSuccess() {
      utils.digests.all.invalidate();
    },
  });

  return (
    <div className="p-4 flex justify-between">
      <div className="space-y-0.5">
        <p className="text-base font-medium">{digest.full_name}</p>
        <div className="text-sm flex items-center gap-x-1.5">
          {digest.phone}
          {digest.enabled ? (
            <Badge className="text-[10px] flex items-center justify-center px-0.5">
              <IconCheck size={14} className="inline" />
            </Badge>
          ) : (
            <Badge
              className="text-[10px] flex items-center justify-center px-0.5"
              variant="destructive"
            >
              <IconX size={14} className="inline" />
            </Badge>
          )}
        </div>
      </div>
      <div>
        <DropdownMenu
          onOpenChange={() => {
            setConfirm(false);
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <IconDotsVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to={`/contacts/${digest.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setOpen(true)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer bg-destructive text-destructive-foreground focus:bg-destructive/50 focus:text-destructive-foreground"
              onClick={(e) => {
                e.preventDefault();
                if (confirm) {
                  remove.mutate(digest.id);
                } else {
                  setConfirm(true);
                }
              }}
            >
              {remove.isLoading
                ? "Deleting..."
                : confirm
                  ? "Are you sure?"
                  : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DigestFormModal digest={digest} open={open} onOpenChange={setOpen} />
    </div>
  );
}
