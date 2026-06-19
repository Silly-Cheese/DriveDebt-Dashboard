import { useState } from 'react';

export default function EditPanel({ record, fields, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...record }));

  async function submit(event) {
    event.preventDefault();
    await onSave(form);
    onCancel();
  }

  return (
    <form className="edit-panel" onSubmit={submit}>
      <div className="form-grid">
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.options ? (
              <select value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}>
                {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ) : (
              <input type={field.type || 'text'} step={field.step} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
            )}
          </label>
        ))}
      </div>
      <div className="row-actions left-actions">
        <button className="mini-button">Save</button>
        <button className="mini-button" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
