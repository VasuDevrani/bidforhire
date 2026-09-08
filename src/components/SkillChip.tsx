interface SkillChipProps {
  skill: string;
}

export function SkillChip({ skill }: SkillChipProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
      {skill}
    </span>
  );
}