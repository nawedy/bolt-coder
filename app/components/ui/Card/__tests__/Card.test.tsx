import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardGrid } from '~/components/ui/Card/Card';

describe('Card Component', () => {
  it('renders basic card with title', () => {
    render(<Card title="Test Card" />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Card title="Test Card" description="Test Description" />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('applies animation data attribute when animated', () => {
    const { container } = render(<Card title="Test Card" animated />);
    expect(container.firstChild).toHaveAttribute('data-animated', 'true');
  });

  it('handles interactive mode correctly', () => {
    const onClick = vi.fn();
    render(<Card title="Test Card" interactive onClick={onClick} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('data-interactive', 'true');

    fireEvent.click(card);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders footer content when provided', () => {
    render(<Card title="Test Card" footer={<button>Action</button>} />);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});

describe('CardGrid Component', () => {
  it('renders multiple cards in a grid', () => {
    render(
      <CardGrid>
        <Card title="Card 1" />
        <Card title="Card 2" />
        <Card title="Card 3" />
      </CardGrid>,
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });
});
