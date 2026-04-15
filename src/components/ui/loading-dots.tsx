export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary/70"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </div>
  );
}
