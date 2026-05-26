import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

afterEach(() => {
  jest.useRealTimers();
});

test('utilise le type erreur par defaut', () => {
  const { result } = renderHook(() => useToast());

  act(() => {
    result.current.showToast('Erreur');
  });

  expect(result.current.toastType).toBe('error');
});

test('affiche puis masque automatiquement le toast', () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => useToast(3000));

  act(() => {
    result.current.showToast('Message de test', 'success');
  });

  expect(result.current.toastMessage).toBe('Message de test');
  expect(result.current.toastType).toBe('success');

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(result.current.toastMessage).toBe('');
});
