import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  labelWhenLoading?: string;
};

export default function LoadingButton({
  loading = false,
  labelWhenLoading = "Loading…",
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button disabled={loading || disabled} {...rest}>
      {loading ? labelWhenLoading : children}
    </button>
  );
}
