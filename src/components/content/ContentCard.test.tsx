import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeItem } from '@/test/fixtures';
import { renderWithStore } from '@/test/render';
import { ContentCard } from './ContentCard';

describe('ContentCard', () => {
  it('shows the headline, description and a "Read More" link for news', () => {
    const item = makeItem({ title: 'Big news', description: 'Details here', url: 'https://example.com/big' });
    renderWithStore(<ContentCard item={item} />);

    expect(screen.getByRole('article', { name: 'Big news' })).toBeInTheDocument();
    expect(screen.getByText('Details here')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /read more/i });
    expect(link).toHaveAttribute('href', 'https://example.com/big');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows author, hashtags and likes for social posts', () => {
    renderWithStore(
      <ContentCard item={makeItem({ type: 'social', author: '@tara', likes: 1200, hashtags: ['#AI', '#WebDev'] })} />,
    );
    expect(screen.getByRole('link', { name: /view post/i })).toBeInTheDocument();
    expect(screen.getByText('@tara')).toBeInTheDocument();
    expect(screen.getByText('#WebDev')).toBeInTheDocument();
    expect(screen.getByText('1200 likes')).toBeInTheDocument();
  });

  it('toggles the favorite state in the store', async () => {
    const item = makeItem();
    const { store, user } = renderWithStore(<ContentCard item={item} />);
    const button = screen.getByRole('button', { name: 'Favorite' });

    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(store.getState().favorites.ids).toEqual([item.id]);

    await user.click(button);
    expect(store.getState().favorites.ids).toEqual([]);
  });

  it('falls back to a placeholder when the image fails to load', () => {
    const { container } = renderWithStore(<ContentCard item={makeItem({ imageUrl: 'https://img.example.com/broken.jpg' })} />);
    const image = container.querySelector('img');
    expect(image).not.toBeNull();

    fireEvent.error(image!);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByTestId('image-fallback')).toBeInTheDocument();
  });

  it('renders a rank badge when ranked', () => {
    renderWithStore(<ContentCard item={makeItem()} rank={2} />);
    expect(screen.getByText('Rank 2')).toBeInTheDocument();
  });
});
