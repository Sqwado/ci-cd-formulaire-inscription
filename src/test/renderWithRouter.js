import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export function renderWithRouter(ui, { route = '/', state } = {}) {
  const initialEntry = state ? [{ pathname: route, state }] : [route];
  return render(<MemoryRouter initialEntries={initialEntry}>{ui}</MemoryRouter>);
}
