import React from 'react';
import { Sparkles, Eraser, Scissors } from 'lucide-react';
import { useState } from 'react';

import axios from 'axios'
import toast from 'react-hot-toast';

import { useAuth } from '@clerk/clerk-react';


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL; 



function RemoveObject() {

    const [input, setInput] = useState('')
    const [object, setobject] = useState('')
    const [loading ,setloading] =useState(false)
    const [content , setcontent] = useState('')

    const { getToken } = useAuth()


    const onsbmitHandler = async (e) => {
        e.preventDefault();
        try {
            setloading(true)

            if(object.split(" ").length > 1){
                return toast("Please enter only one object name")
            }

            const formData =new FormData()
            formData.append('image',input)
            formData.append('object',object)

            
            const { data } = await axios.post('/api/ai/remove-image-object', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                setcontent(data.content)
            } else {
                toast.error(data.message)
            }
            
        } catch (Error) {
            toast.error(Error.message)

        }
        setloading(false)
    }
    
    return ( 
         <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-scale-700'>
            {/* left col */}
            <form onSubmit={onsbmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3'>
                    <Sparkles className='w-6 text-[#4A7AFF]' />
                    <h1 className='text-xl font-semibold'>Object Removal</h1>
                </div>
                <p className='mt-6 text-sm font-medium'>Upload image</p>

                <input onChange={(e) => setInput(e.target.files[0])} type="file" accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-900 text-gray-600'
                    required />

                <p className='mt-4 text-sm font medium'>Describe object name to remove</p>
                <textarea onChange={(e)=>setobject(e.target.value)} value={object} rows={4} className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
                    placeholder='eg., watch or spoon ,only single object name' required />
                
                
                <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
                    {
                        loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'> </span>
                        :<Scissors className='w-5' />
                    } 
                    Remove Object
                </button>
            </form>

            {/* Right col */}
            <div className='w-full max-w-lg mr-5 p-6 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 '>
                <div className='flex items-center gap-3'>
                    <Scissors className='w-5 h-5 text-[#417DF6]' />
                    <h1 className='text-xl font-semibold'>Processed Image</h1>
                </div>
                {
                    !content ? 
                    (                <div className='flex-1 flex justify-center items-center'>
                    <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                        <Scissors className='w-9 h-9' />
                        <p>Upload an image and click "Remove Object" to get started</p>
                    </div>
                </div>)
                    :
                    (
                        <img src={content} alt="" className='w-full mt-3 h-full' />
                    )
                }

            </div>

        </div>
     );
}

export default RemoveObject;