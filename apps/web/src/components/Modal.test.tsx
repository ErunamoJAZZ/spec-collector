import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Modal Component', () => {
  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    // The close button has the X icon from lucide-react. 
    // We can find it by its role or container if needed, but let's try finding the button.
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
