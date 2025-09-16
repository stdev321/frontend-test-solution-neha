import { useState, useRef, useEffect } from 'react';

const useDialogManager = ({ onUpdateTitle, onDeleteConversation, setDialogError }) => {
  /* ----------------- EDIT TITLE ----------------- */
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const editButtonRef = useRef(null);

  useEffect(() => {
    if (!editDialogOpen && editButtonRef.current) {
      editButtonRef.current.focus();
      editButtonRef.current = null;
    }
    if (!editDialogOpen) {
      setItemToEdit(null);
      setEditedTitle('');
      setIsUpdating(false);
    }
  }, [editDialogOpen]);

  const handleClickEditItem = (conv, event) => {
    setItemToEdit(conv);
    setEditedTitle(conv.title || '');
    setDialogError('');
    editButtonRef.current = event?.currentTarget || null;
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => setEditDialogOpen(false);

  const handleConfirmEditTitle = async () => {
    if (!itemToEdit || !editedTitle.trim()) return;
    setIsUpdating(true);
    setDialogError('');
    try {
      await onUpdateTitle(itemToEdit.id, editedTitle.trim());
      handleCloseEditDialog();
    } catch (err) {
      setDialogError(err.message || 'Failed to update title.');
    } finally {
      setIsUpdating(false);
    }
  };

  /* ----------------- DELETE ONE ----------------- */
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

  /* ----------------- DELETE MANY ----------------- */
  const [multiDeleteDialogOpen, setMultiDeleteDialogOpen] = useState(false);
  const [isMultiDeleting, setIsMultiDeleting] = useState(false);

  const openMultiDelete = () => setMultiDeleteDialogOpen(true);
  const closeMultiDelete = () => setMultiDeleteDialogOpen(false);

  const handleConfirmMultiDelete = async (idsToDelete = []) => {
    if (idsToDelete.length === 0) return;
    setIsMultiDeleting(true);
    setDialogError('');
    const errors = [];
    for (const id of idsToDelete) {
      try {
        await onDeleteConversation(id);
      } catch (err) {
        errors.push(id);
      }
    }
    setIsMultiDeleting(false);
    closeMultiDelete();
    if (errors.length > 0) {
      setDialogError(`Failed to delete ${errors.length} consultation(s). Please try again or refresh.`);
    }
  };

  return {
    edit: {
      editDialogOpen,
      itemToEdit,
      editedTitle,
      isUpdating,
      editButtonRef,
      setEditedTitle,
      handleClickEditItem,
      handleCloseEditDialog,
      handleConfirmEditTitle,
    },
    deleteOne: {
      deleteDialogOpen,
      itemToDelete,
      isDeleting,
      handleClickDeleteItem,
      handleCloseDeleteDialog,
      handleConfirmDeleteItem,
    },
    deleteMany: {
      multiDeleteDialogOpen,
      isMultiDeleting,
      openMultiDelete,
      closeMultiDelete,
      handleConfirmMultiDelete,
      setMultiDeleteDialogOpen,
    },
  };
};

export default useDialogManager; 