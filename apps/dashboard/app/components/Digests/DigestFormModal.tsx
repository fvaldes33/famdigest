// @ts-ignore
import InputMask from "@mona-health/react-input-mask";
import { useForm } from "@mantine/form";
import { Link } from "@remix-run/react";
import { Table, digestsRowSchema } from "@repo/supabase";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  toast,
} from "@repo/ui";
import { IconLoader2 } from "@tabler/icons-react";
import { memo, useEffect, useId, useState } from "react";
import { z } from "zod";
import {
  convertToLocal,
  convertToUTC,
  getUtcOffset,
  guessTimezone,
} from "~/lib/dates";
import { trpc } from "~/lib/trpc";

type DigestFormModalProps = React.ComponentPropsWithoutRef<typeof Dialog> & {
  children?: React.ReactNode;
  digest?: Table<"digests">;
};

const formValues = digestsRowSchema.pick({
  full_name: true,
  phone: true,
  timezone: true,
  notify_on: true,
  enabled: true,
});

function getAllTimezones() {
  const tz = [];
  for (const timeZone of Intl.supportedValuesOf("timeZone")) {
    tz.push(timeZone);
  }
  return tz;
}

export function DigestFormModal({
  digest,
  children,
  open,
  onOpenChange,
}: DigestFormModalProps) {
  const id = useId();
  // const [open, setOpen] = useState(false);
  const [tz] = useState(() => getAllTimezones());
  const utils = trpc.useUtils();
  const onSuccess = async () => {
    await utils.digests.invalidate();
    onOpenChange?.(false);
    toast({
      title: digest ? "Contact Updated!" : "Contact Added!",
    });
  };

  const create = trpc.digests.create.useMutation({ onSuccess });
  const update = trpc.digests.update.useMutation({ onSuccess });

  const form = useForm<z.infer<typeof formValues>>({
    initialValues: {
      full_name: digest?.full_name ?? "",
      phone: digest?.phone ?? "",
      timezone: digest?.timezone ?? "",
      notify_on: digest
        ? convertToLocal(digest.notify_on).format("HH:mm:ss")
        : "",
      enabled: digest?.enabled ?? true,
    },
  });

  useEffect(() => {
    form.setValues((prev) => ({
      ...prev,
      timezone: prev.timezone || guessTimezone(),
    }));
  }, []);

  const onSubmit = (values: typeof form.values) => {
    //...
    const notify_on = convertToUTC(values.notify_on);
    if (digest) {
      update.mutate({
        ...values,
        id: digest.id,
        notify_on,
      });
    } else {
      create.mutate({
        ...values,
        notify_on,
      });
    }
  };

  const isLoading = create.isLoading || update.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact</DialogTitle>
          <DialogDescription>
            Add a new subscriber to your daily digest.
          </DialogDescription>
        </DialogHeader>
        <form key={digest?.id ?? id} onSubmit={form.onSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              {...form.getInputProps("full_name")}
              render={(field) => <Input {...field} />}
            />
            <FormField
              label="Phone Number"
              {...form.getInputProps("phone")}
              render={(field) => (
                <InputMask mask="+1 999.999.9999" {...field}>
                  <Input />
                </InputMask>
              )}
            />
            <FormField<typeof Select>
              label="Timezone"
              {...form.getInputProps("timezone")}
              render={(field) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => form.setFieldValue("timezone", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {tz.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormField
              label="Time"
              type="time"
              {...form.getInputProps("notify_on")}
              render={(field) => <Input {...field} />}
            />
            <FormField<typeof Switch>
              label="Enabled"
              {...form.getInputProps("enabled", { type: "checkbox" })}
              render={(field) => (
                <Switch
                  {...field}
                  onCheckedChange={(checked) =>
                    form.setFieldValue("enabled", checked)
                  }
                />
              )}
            />
          </div>
          <DialogFooter className="pt-6">
            <p className="text-xs">
              By creating this digest, you agree to our{" "}
              <Link to="https://www.famdigest.com/terms" className="underline">
                terms
              </Link>{" "}
              and <strong>opt-in</strong> to receive SMS messages from
              FamDigest.com
            </p>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <IconLoader2 size={20} className="animate-spin mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
