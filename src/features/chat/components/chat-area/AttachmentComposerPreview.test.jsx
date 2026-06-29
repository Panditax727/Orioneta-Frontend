import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttachmentComposerPreview from './AttachmentComposerPreview';

const imageAttachment = {
  kind: 'image',
  name: 'photo.jpg',
  size: 102400,
  type: 'image/jpeg',
  previewUrl: 'data:image/jpeg;base64,test',
};

const fileAttachment = {
  kind: 'file',
  name: 'document.pdf',
  size: 512000,
  type: 'application/pdf',
};

describe('AttachmentComposerPreview', () => {
  it('renders attachment name', () => {
    render(<AttachmentComposerPreview attachment={fileAttachment} onRemove={() => {}} />);
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });

  it('renders image preview when kind is image with previewUrl', () => {
    render(<AttachmentComposerPreview attachment={imageAttachment} onRemove={() => {}} />);
    const img = screen.getByAltText('photo.jpg');
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('data:image/jpeg');
  });

  it('calls onRemove when remove button clicked', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<AttachmentComposerPreview attachment={fileAttachment} onRemove={onRemove} />);
    await user.click(screen.getByTitle('Quitar archivo'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
