import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserFailure, deleteUserSuccess } from '../redux/user/userSlice.js';
import { useDispatch } from 'react-redux';

function Profile() {
  const { currentUser, loading, error } = useSelector(state => state.user);

  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value, });
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      let avatarUrl = currentUser.avatar;

      if (file) {
        const formDataCloud = new FormData();
        formDataCloud.append("image", file);

        const res = await fetch("/api/user/upload", {
          method: "POST",
          body: formDataCloud
        });

        const data = await res.json();
        avatarUrl = data.secure_url;
        setFile(null)
      }


      const res2 = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData
        })
      });

      const data = await res2.json();
      if (data.success == false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess());

    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={handleFileUpload} type="file" ref={fileRef} hidden accept='images/*' />
        <img src={preview || formData.avatar || currentUser.avatar} onClick={() => fileRef.current.click()} alt="profile" className='rounded-full h-24 w-24 object-cover hover:cursor-pointer self-center mt-2' />
        <input onChange={handleChange} defaultValue={currentUser.username} type='text' id='username' placeholder='username' className='border p-3 rounded-lg' />
        <input onChange={handleChange} defaultValue={currentUser.email} type='email' id='email' placeholder='email' className='border p-3 rounded-lg' />
        <input onChange={handleChange} type='password' id='password' placeholder='password' className='border p-3 rounded-lg' />
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'Loading...' : 'Update'}</button>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? 'User is updated successfully!' : ''}</p>
    </div>
  )
}

export default Profile