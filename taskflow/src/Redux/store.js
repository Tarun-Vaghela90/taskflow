import { configureStore } from '@reduxjs/toolkit';
import projectReducer from './Slices/projectSlice';
import taskReducer from './Slices/taskSlice'
export const store = configureStore({
  reducer: {
    project: projectReducer,
    task: taskReducer,
  },
})