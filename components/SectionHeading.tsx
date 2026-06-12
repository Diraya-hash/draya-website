export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  light = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <span
        className={`eyebrow ${center ? "justify-center" : ""} ${
          light ? "!text-mint/80" : ""
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-6 text-3xl font-medium leading-snug sm:text-4xl ${
          light ? "text-cream" : "text-teal-950"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-6 text-base font-light leading-8 sm:text-lg sm:leading-9 ${
            light ? "text-cream/65" : "text-ink-soft"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
