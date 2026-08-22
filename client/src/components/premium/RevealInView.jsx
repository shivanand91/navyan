export function RevealInView({
  children,
  className
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
