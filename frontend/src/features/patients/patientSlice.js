import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { patientAPI } from '../../api/services';

export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await patientAPI.getAll(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const fetchPatient = createAsyncThunk('patients/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await patientAPI.getOne(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch patient');
  }
});

export const createPatient = createAsyncThunk('patients/create', async (patientData, { rejectWithValue }) => {
  try {
    const { data } = await patientAPI.create(patientData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create patient');
  }
});

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ id, data: patientData }, { rejectWithValue }) => {
    try {
      const { data } = await patientAPI.update(id, patientData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update patient');
    }
  }
);

export const deletePatient = createAsyncThunk('patients/delete', async (id, { rejectWithValue }) => {
  try {
    await patientAPI.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete patient');
  }
});

export const restorePatient = createAsyncThunk('patients/restore', async (id, { rejectWithValue }) => {
  try {
    const { data } = await patientAPI.restore(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to restore patient');
  }
});

const patientSlice = createSlice({
  name: 'patients',
  initialState: {
    patients: [],
    selectedPatient: null,
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearPatientError: (state) => { state.error = null; },
    clearSelectedPatient: (state) => { state.selectedPatient = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload.patients;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatient.fulfilled, (state, action) => {
        state.selectedPatient = action.payload;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.patients.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const idx = state.patients.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.patients[idx] = action.payload;
        if (state.selectedPatient?._id === action.payload._id) {
          state.selectedPatient = action.payload;
        }
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter((p) => p._id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(restorePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter((p) => p._id !== action.payload._id);
      });
  },
});

export const { clearPatientError, clearSelectedPatient } = patientSlice.actions;
export default patientSlice.reducer;
