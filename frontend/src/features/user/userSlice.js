import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios.js'
import toast from 'react-hot-toast';

const initialState = {
    value: null
}

export const fetchUser = createAsyncThunk('user/fetchUser' , async(token) => {
     const { data } = await api.get('/api/user/data' , {headers:{Authorization: `Bearer ${token}`}})
     return data.success ? data.user : null
});


export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userData, token }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/user/updated', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
         toast.success(data.message)
        return data.user; // ✅ just return user
      } else {
        return rejectWithValue(data.message); // ✅ reject for toast.promise
      }
    } catch (error) {
      return rejectWithValue(error.message); // ✅ network/server error
    }
  }
);


// export const updateUser = createAsyncThunk('user/updateUser' , async({userData , token}) => {
//      const { data } = await api.post('/api/user/updated', userData , {headers:{Authorization: `Bearer ${token}`}})
//      if(data.success){
//         toast.success(data.message)
//         return data.user
//      }else{
//         toast.error(data.message)
//         return null
//      }
// });


const userSlice = createSlice({
    name:'user',
    initialState,
    reducers: {
        
    },
    extraReducers: (bulider) => {
        bulider.addCase(fetchUser.fulfilled, (state, action) => {
          state.value = action.payload
        }).addCase(updateUser.fulfilled, (state, action) => {
          state.value = action.payload
        })
    }
})

export default userSlice.reducer