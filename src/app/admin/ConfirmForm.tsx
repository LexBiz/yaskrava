"use client";

export function ConfirmForm({
  action,
  confirmMessage,
  children,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </form>
  );
}
