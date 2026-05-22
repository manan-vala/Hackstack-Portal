import { cn } from './utils';

/** Native progress bar — avoids Radix/React duplicate instance issues in Vite dev. */
function Progress({ className, value = 0, ...props }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="bg-primary h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
