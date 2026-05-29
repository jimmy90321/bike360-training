const weeks = ['本週', '上週', '2週前', '3週前'];

export default function WeekTabs({ selected, onChange }) {
  return (
    <div className="week-tabs">
      {weeks.map((label, i) => (
        <button key={i} className={selected === i ? 'active' : ''} onClick={() => onChange(i)}>
          {label}
        </button>
      ))}
    </div>
  );
}