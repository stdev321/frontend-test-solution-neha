// frontend/src/pages/admin/AdminPersonasPage.jsx

import React from 'react';
import { Box, Button, CircularProgress, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { usePersonasTable } from '../../../src/hooks/usePersonasTable';
import { useNavigate } from 'react-router-dom';
import {
  updatePersona,
  upsertPrompt,
  setPersonaTags,
} from '../../../src/services/api';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon 
} from '@mui/icons-material';
import Papa from 'papaparse';            // ‹-- already in package.json

export default function AdminPersonasPage() {
  const { rows, setRows, loading } = usePersonasTable();
  const navigate = useNavigate();

  /* ------------- grid definition ------------- */
  const columns = [
    { 
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/admin/personas/${params.row.id}`)}
            title="View/Edit Details"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    },
    { field: 'id', headerName: 'ID', width: 200, editable: false },
    { field: 'name', headerName: 'Name', width: 180, editable: true },
    { field: 'specialty', width: 160, editable: true },
    { field: 'model_name', headerName: 'Model', width: 160, editable: true },
    { field: 'image', headerName: 'Image Path', width: 230, editable: true },
    { field: 'system_prompt_id', width: 230, editable: true },
    { field: 'system_prompt', headerName: 'Prompt Text', flex: 1, editable: true },
    { field: 'public_bio', headerName: 'Public Bio', flex: 1, editable: true },
    { field: 'tags', headerName: 'Tags (csv)', width: 180, editable: true },
  ];

  /* ------------- inline editing ------------- */
  const handleEdit = ({ id, field, props }) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: props.value } : r))
    );
  };

  /* ------------- save button ------------- */
  const handleSave = async () => {
    for (const r of rows) {
      // 1. persona
      await updatePersona(r.id, {
        name: r.name,
        specialty: r.specialty,
        model_name: r.model_name,
        image: r.image,
        public_bio: r.public_bio,
        system_prompt_id: r.system_prompt_id,
      });

      // 2. prompt text (skip if empty)
      if (r.system_prompt) {
        await upsertPrompt(r.system_prompt_id, {
          id: r.system_prompt_id,
          name: `persona_${r.id}_system`,
          content: r.system_prompt,
        });
      }

      // 3. tags (csv → array)
      const tagArr = r.tags
        ? r.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      await setPersonaTags(r.id, tagArr);
    }
    alert('Saved!');
  };

  /* ------------- export CSV ------------- */
  const handleExport = () => {
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'personas.csv';
    a.click();
  };

  /* ------------- import CSV ------------- */
  const fileRef = React.useRef();
  const handleImport = (e) => {
    if (!e.target.files?.length) return;
    Papa.parse(e.target.files[0], {
      header: true,
      complete: (res) => setRows(res.data),
    });
  };

  return (
    <Box sx={{ p: 3, height: '85vh', width: '100%' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <DataGrid
            rows={rows}
            columns={columns}
            editMode='cell'
            onEditCellPropsChange={handleEdit}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant='contained'
              color='success'
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/personas/new')}
            >
              Create New Persona
            </Button>
            <Button variant='contained' onClick={handleSave}>
              Save All
            </Button>
            <Button variant='outlined' onClick={handleExport}>
              Export CSV
            </Button>
            <Button
              variant='outlined'
              onClick={() => fileRef.current.click()}
            >
              Import CSV
            </Button>
            <input
              type='file'
              accept='.csv'
              hidden
              ref={fileRef}
              onChange={handleImport}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
