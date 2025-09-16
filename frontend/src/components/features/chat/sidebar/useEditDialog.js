import { useState, useRef, useEffect } from 'react';

const useEditDialog = ({ onUpdateTitle }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const editButtonRef = useRef(null);

  // focus management & cleanup mirroring former effect
  useEffect(() => {
    if (!editDialogOpen && editButtonRef.current) {
      editButtonRef.current.focus();
      editButtonRef.current = null;
    }
    if (!editDialogOpen) {
      setItemToEdit(null);
      setEditedTitle('');
      setIsUpdating(false);
      setDialogError('');
    }
  }, [editDialogOpen]);

  const handleClickEditItem = (conv, event) => {
    setItemToEdit(conv);
    setEditedTitle(conv.title || '');
    setDialogError('');
    editButtonRef.current = event?.currentTarget || null;
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

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

  return {
    // state
    editDialogOpen,
    itemToEdit,
    editedTitle,
    isUpdating,
    dialogError,
    editButtonRef,
    // setters (if needed elsewhere)
    setEditedTitle,
    // handlers
    handleClickEditItem,
    handleCloseEditDialog,
    handleConfirmEditTitle,
    setDialogError,
  };
};

export default useEditDialog; 