import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('CO2 Food Tracker')).toBeInTheDocument();
  });

  it('should render an h1 heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('CO2 Food Tracker');
  });

  it('should render the tagline', () => {
    render(<App />);
    expect(
      screen.getByText('Understand the carbon footprint of your food')
    ).toBeInTheDocument();
  });

  it('should apply Tailwind utility classes', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).toContain('text-3xl');
    expect(heading.className).toContain('font-bold');
    expect(heading.className).toContain('text-primary');
  });
});
