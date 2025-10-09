import React from "react";

type Props = {
  schema?: any;
  value?: any;
  onChange?: (v: any) => void;
  onSubmit?: (v: any) => void;
};

export default function VsmeForm({ schema, value, onChange, onSubmit }: Props) {
  const [local, setLocal] = React.useState<any>(value ?? {});
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(local);
      }}
    >
      {/* Placeholder – asendame B1 pärisvormiga */}
      <textarea
        style={{ width: "100%", minHeight: 120 }}
        value={JSON.stringify(local, null, 2)}
        onChange={(e) => {
          try {
            const v = JSON.parse(e.target.value);
            setLocal(v);
            onChange?.(v);
          } catch {
            /* ignore */
          }
        }}
      />
      <div style={{ marginTop: 8 }}>
        <button type="submit">Save draft</button>
      </div>
    </form>
  );
}
