export default function SafeActionButton({ children, onAction, promptText = 'Continue?', className = 'mini-button danger-button' }) {
  async function handleClick() {
    const approved = window.confirm(promptText);
    if (!approved) return;
    await onAction();
  }

  return <button className={className} onClick={handleClick}>{children}</button>;
}
