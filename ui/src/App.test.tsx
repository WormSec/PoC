import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('Check app', () => {
  render(<App />);
  const linkElement = screen.getByText(/WormSec/i);
  expect(linkElement).toBeInTheDocument();
});
