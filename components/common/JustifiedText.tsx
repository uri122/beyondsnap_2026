type JustifiedTextProps = {
  text: string;
  width?: string;
};

export function JustifiedText({ text, width = "3.5em" }: JustifiedTextProps) {
  return (
    <span
      aria-label={text}
      className="inline-flex justify-between"
      style={{ width }}
    >
      {text.split("").map((char, i) => (
        <span key={i} aria-hidden="true">
          {char}
        </span>
      ))}
    </span>
  );
}
