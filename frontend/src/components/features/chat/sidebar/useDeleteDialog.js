import { useState } from 'react';

const useDeleteDialog = ({ onDeleteConversation, setDialogError }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClickDeleteItem = (conv) => {
    setItemToDelete(conv);
    setDialogError('');
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setIsDeleting(false);
    setDialogError('');
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDialogError('');
    try {
      await onDeleteConversation(itemToDelete.id);
      handleCloseDeleteDialog();
    } catch (err) {
      setDialogError(err.message || 'Failed to delete conversation.');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDialogOpen,
    itemToDelete,
    isDeleting,
    handleClickDeleteItem,
    handleCloseDeleteDialog,
    handleConfirmDeleteItem,
  };
};

export default useDeleteDialog; 