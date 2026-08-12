// ---------- removal request modal ----------
// Sends a real email via /api/removal-request (Resend under the hood) —
// see that file for the server side.

export function createRemovalModal({ triggerEl, overlayEl, messageEl, emailEl, statusEl, submitEl, cancelEl }) {
  function open() {
    messageEl.value = '';
    emailEl.value = '';
    statusEl.hidden = true;
    statusEl.textContent = '';
    overlayEl.hidden = false;
    messageEl.focus();
  }

  function close() {
    overlayEl.hidden = true;
  }

  triggerEl.addEventListener('click', open);
  cancelEl.addEventListener('click', close);

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlayEl.hidden) close();
  });

  submitEl.addEventListener('click', async () => {
    const message = messageEl.value.trim();
    if (!message) {
      statusEl.hidden = false;
      statusEl.textContent = 'let us know which song, and why.';
      return;
    }

    submitEl.disabled = true;
    submitEl.textContent = 'sending…';
    statusEl.hidden = true;

    try {
      const res = await fetch('/api/removal-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, fromEmail: emailEl.value.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'failed to send');

      statusEl.hidden = false;
      statusEl.textContent = 'sent — thank you.';
      setTimeout(close, 1500);
    } catch (err) {
      statusEl.hidden = false;
      statusEl.textContent = 'something went wrong — please try again.';
    } finally {
      submitEl.disabled = false;
      submitEl.textContent = 'send request';
    }
  });
}
