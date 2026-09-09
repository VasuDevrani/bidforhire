interface SkillChipProps {
  skill: string;
}

export function SkillChip({ skill }: SkillChipProps) {
  return (
    <span
      className="inline-flex items-center rounded-full border-2 border-border
                 bg-muted px-2.5 py-0.5 font-display text-xs font-semibold
                 text-muted-foreground transition-colors hover:border-accent
                 hover:bg-accent/10 hover:text-accent"
    >
      {skill}
    </span>
  );
}