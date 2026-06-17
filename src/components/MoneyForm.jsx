import { useState } from 'react';

export default function MoneyForm({ title, fields, buttonText, onSave }) {
  const empty = Object.fromEntries(fields.map((f) => [f.name, f.value || '']));
  const [form, setForm] = useState(empty);

  async function submit(e) {
    e.preventDefault();
    await onSave(form);
    setForm(empty);
  }

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <h3>{title}</h3>
      <div className="form-grid">
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.options ? (
              <select value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}>
                {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                step={field.step || undefined}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                required
              />
            )}
          </label>
        ))}
      </div>
      <button className="primary-button">{buttonText}</button>
    </form>
  );
}
