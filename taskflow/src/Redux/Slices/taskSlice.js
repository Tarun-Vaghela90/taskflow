// src/Redux/Slices/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/tasks';

// Async Thunks

export const fetchtasks = createAsyncThunk('task/fetchtasks', async () => {
    const token = localStorage.getItem("Token");

    // const response = await axios.get(API_URL, { headers: { Token: token } });
    // console.log(response.data.data)
    // return response.data.data;
    const response = await axios.get('http://localhost:3000/api/v1/projects/projectsData');
    console.log(response.data.data)
    return response.data.data;
});

export const fetchtaskById = createAsyncThunk('task/fetchtaskById', async (taskId) => {
    const token = localStorage.getItem("Token");

    const response = await axios.get(`${API_URL}/${taskId}`, { headers: { Token: token } });
    return response.data.data;
});

export const createtask = createAsyncThunk('task/createtask', async (formData) => {
    // This logs the already-built FormData
    for (let pair of formData.entries()) {
        console.log("formdata", pair[0], pair[1]);
    }

    const token = localStorage.getItem("Token");

    const response = await axios.post("http://localhost:3000/api/v1/tasks", formData, {
        headers: {
            Token: token,
        },
    });

    return response.data.data;
});




export const updatetask = createAsyncThunk('task/updatetask', async ({ taskId, updatedData }) => {
    const token = localStorage.getItem('Token');

    const response = await axios.put(`${API_URL}/${taskId}`, updatedData, {
        headers: { Token: token },
    });

    // Return updatedData field from response
    return response.data.updatedData;
});

// update  status + timer  update
export const updateTaskStatus = createAsyncThunk(
    'task/updateTaskStatus',
    async ({ taskId, status }, { getState, rejectWithValue }) => {
        const token = localStorage.getItem('Token');

        try {
            const response = await axios.patch(
                `${API_URL}/${taskId}/status`,
                { status },
                { headers: { Token: token } }
            );
            return response.data.data;
        } catch (error) {
            // If API fails, revert
            const oldTask = getState().task.tasks.find(t => t.id === taskId);
            return rejectWithValue(oldTask);
        }
    }
);



export const deletetask = createAsyncThunk('task/deletetask', async (taskId) => {
    const token = localStorage.getItem('Token');

    await axios.delete(`${API_URL}/${taskId}`, { headers: { Token: token } });
    return taskId;
});

const initialState = {
    tasks: [],
    selectedtask: null,
    loading: false,
    error: null,
};

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        clearSelectedtask: (state) => {
            state.selectedtask = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchtasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchtasks.fulfilled, (state, action) => {
                state.loading = false;
                const STATUS_MAP = {
                    pending: 'TODO',
                    progress: 'IN_PROGRESS',
                    completed: 'DONE',
                };
                state.tasks = action.payload.map((task) => ({
                    ...task,
                    status: STATUS_MAP[task.status] || task.status,
                }));
            })
            .addCase(fetchtasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(fetchtaskById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchtaskById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedtask = action.payload;
            })
            .addCase(fetchtaskById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(createtask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createtask.fulfilled, (state, action) => {
                const STATUS_MAP = {
                    pending: 'TODO',
                    progress: 'IN_PROGRESS',
                    completed: 'DONE',
                };
                const newTask = {
                    ...action.payload,
                    status: STATUS_MAP[action.payload.status] || action.payload.status,
                };
                state.tasks.push(newTask);
            })
            .addCase(createtask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(updatetask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatetask.fulfilled, (state, action) => {
                state.loading = false;
                const updatedTask = action.payload;
                const index = state.tasks.findIndex((task) => task.id === updatedTask.id);
                if (index !== -1) {
                    state.tasks[index] = updatedTask;
                }
                if (state.selectedtask?.id === updatedTask.id) {
                    state.selectedtask = updatedTask;
                }
            })

            .addCase(updatetask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateTaskStatus.pending, (state, action) => {
                const { taskId, status } = action.meta.arg; // from dispatch args
                const index = state.tasks.findIndex(task => task.id === taskId);
                if (index !== -1) {
                    state.tasks[index] = {
                        ...state.tasks[index],
                        status
                    };
                }
            })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                const updatedTask = action.payload;
                const index = state.tasks.findIndex(task => task.id === updatedTask.id);
                if (index !== -1) {
                    state.tasks[index] = updatedTask;
                }
            })
            .addCase(updateTaskStatus.rejected, (state, action) => {
                // Revert if API fails
                if (action.payload) {
                    const oldTask = action.payload;
                    const index = state.tasks.findIndex(task => task.id === oldTask.id);
                    if (index !== -1) {
                        state.tasks[index] = oldTask;
                    }
                }
            })



            .addCase(deletetask.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter((task) => task.id !== action.payload);
                state.selectedtask = null;
            });
    },
});

export const { clearSelectedtask } = taskSlice.actions;
export default taskSlice.reducer;
