function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  testId,
  errorTestId,
  value,
  error,
  onChange
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        data-testid={testId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {error && (
        <span className="field-error" data-testid={errorTestId}>
          {error}
        </span>
      )}
    </label>
  );
}

export default FormField;
