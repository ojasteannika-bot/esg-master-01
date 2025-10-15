import * as React from "react";

export function Container({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
export default Container;
