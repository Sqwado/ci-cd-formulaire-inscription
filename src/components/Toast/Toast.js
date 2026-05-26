import './Toast.css';

function Toast({ message, type = 'error' }) {
  if (!message) {
    return null;
  }

  const testId = type === 'success' ? 'success-toast' : 'error-toast';

  return (
    <div
      className={`toast toast-${type}`}
      role="alert"
      data-testid={testId}
    >
      {message}
    </div>
  );
}

export default Toast;
