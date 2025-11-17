import React, { useState, useEffect, useCallback } from 'react';
import {
  useSubscriptions,
  useCancelSubscription,
  SubscriptionsTable,
  DeleteConfirmModal,
  SubscriptionDetailModal,
} from '../features/subscriptions';
import type { Subscription } from '../types';
import './Subscriptions.css';

const Subscriptions = () => {
  const { data: subscriptions, isLoading, error } = useSubscriptions();
  const cancelSubscriptionMutation = useCancelSubscription();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);

  const handleRowClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleCloseDetailModal = () => {
    setSelectedSubscription(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, subscriptionId: string) => {
    e.stopPropagation(); // Prevent row expansion
    setSubscriptionToDelete(subscriptionId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (subscriptionToDelete) {
      try {
        await cancelSubscriptionMutation.mutateAsync(subscriptionToDelete);
        setDeleteModalOpen(false);
        setSubscriptionToDelete(null);
      } catch (error) {
        console.error('Failed to delete subscription:', error);
      }
    }
  }, [subscriptionToDelete, cancelSubscriptionMutation]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setSubscriptionToDelete(null);
  }, []);

  // Handle keyboard events for all modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Close detail modal if open
        if (selectedSubscription) {
          handleCloseDetailModal();
        }
        // Close delete modal if open
        if (deleteModalOpen) {
          handleDeleteCancel();
        }
      } else if (e.key === 'Enter' && deleteModalOpen) {
        e.preventDefault();
        handleDeleteConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteModalOpen, selectedSubscription, handleDeleteConfirm, handleDeleteCancel]);

  if (isLoading) {
    return (
      <div className="subscriptions-page">
        <div className="page-header">
          <h1>Subscriptions</h1>
        </div>
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscriptions-page">
        <div className="page-header">
          <h1>Subscriptions</h1>
        </div>
        <p className="error-message">Error loading subscriptions: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <h1>Subscriptions</h1>
      </div>

      <SubscriptionsTable
        subscriptions={subscriptions}
        onRowClick={handleRowClick}
        onDeleteClick={handleDeleteClick}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        isDeleting={cancelSubscriptionMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {selectedSubscription && (
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default Subscriptions;
