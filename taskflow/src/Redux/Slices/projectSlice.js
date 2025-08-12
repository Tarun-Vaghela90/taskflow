// src/store/projectSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const token = localStorage.getItem('Token');

// Async thunks for CRUD operations
export const fetchProjects = createAsyncThunk('project/fetchProjects', async () => {
  const response = await axios.get('http://localhost:3000/api/v1/projects/projectsData');
  console.log(response.data.data)
  return response.data.data;
});

export const fetchProjectById = createAsyncThunk('project/fetchProjectById', async (projectId) => {
  const response = await axios.get(`http://localhost:3000/api/v1/projects/project/${projectId}`);
  return response.data;
});

export const createProject = createAsyncThunk('project/createProject', async (projectData) => {

  const response = await axios.post(
    'http://localhost:3000/api/v1/projects/project',
    projectData, // body
    {
      headers: {
        Token: token,
      }
    }
  );
  return response.data.project; // Extract only the 'data' object from response
});


export const updateProject = createAsyncThunk('project/updateProject', async ({ projectId, updatedData }) => {
  const response = await axios.put(`http://localhost:3000/api/v1/projects/project/${projectId}`, updatedData);
  return response.data;
});
export const addProjectMember = createAsyncThunk(
  "project/addProjectMember",
  async ({  members }, thunkAPI) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/projectmembers/",
        {  members }, // backend should accept array
        {
          headers: { Token: token }
        }
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteProject = createAsyncThunk('project/deleteProject', async (projectId) => {
  await axios.delete(`http://localhost:3000/api/v1/projects/project/${projectId}`);
  return projectId;
});

// Initial state
const initialState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })

      .addCase(updateProject.fulfilled, (state, action) => {
        const updatedProject = action.payload.updatedData; // access updatedData
        const index = state.projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
          state.projects[index] = updatedProject;
        }
      })


      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
