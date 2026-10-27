export function OptionButtons({ label, value, options, onChange }) {
  return (
    <div className="blueprint-option-buttons" role="group" aria-label={label}>
      <span className="blueprint-choice-heading">{label}</span>
      <div>
        {options.map(([id, name]) => (
          <button type="button" key={id} aria-pressed={value === id} onClick={() => onChange(id)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
