import React from 'react';
import { Sparkles, Hash } from 'lucide-react';
import { useState } from 'react';
import Markdown from 'react-markdown';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
function Blog() {
    const blogcategories = [
        'General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', "Food"
    ]

    const [selectedcategorie, setSelecetedCategorie] = useState('General')
    const [input, setInput] = useState('')
    const [loading, setloading] = useState(false)
    const [content, setcontent] = useState('')

    const { getToken } = useAuth()


    const onsbmitHandler = async (e) => {
        e.preventDefault();
        try {
            setloading(true)
            const prompt = `Generate a blog title for the keyword ${input} in the category ${selectedcategorie}`
            const { data } = await axios.post('/api/ai/generate-blogtitle', { prompt }, {
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
    }



    return (

        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-scale-700'>
            {/* left col */}
            <form onSubmit={onsbmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3'>
                    <Sparkles className='w-6 text-[#8E37EB]' />
                    <h1 className='text-xl font-semibold'>AI Title Generator</h1>
                </div>
                <p className='mt-6 text-sm font-medium'>keyword</p>

                <input onChange={(e) => setInput(e.target.value)} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
                    placeholder='The future of artificial intelligence is...' required />
                <p className='mt-4 text-sm font medium'>Category</p>
                <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
                    {blogcategories.map((item) => (
                        <span onClick={() => setSelecetedCategorie(item)} className={`text-xs px-4 py-1 border rounded-full cursor-pointer
                            ${selectedcategorie === item ? ' bg-purple-50 text-purple-700' : 'text-gray-500 border-gray-300'} `} key={item}>{item}</span>
                    ))}
                </div>
                <br />
                <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
                    {
                        loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
                            : <Hash className='w-5' />}
                    Generate Title
                </button>
            </form>

            {/* Right col */}
            <div className='w-full max-w-lg mr-5 p-6 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 '>
                <div className='flex items-center gap-3'>
                    <Hash className='w-5 h-5 text-[#4A7AFF]' />
                    <h1 className='text-xl font-semibold'>Generated Titles</h1>
                </div>
                {!content ? (
                    <div className='flex-1 flex justify-center items-center'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <Hash className='w-9 h-9' />
                            <p>Enter a topic and click "Generate title" to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className='mt-3 h-full overflow-y-scroll text-sm text-scale-600'>
                        <div className='.reset-tw'>
                            <Markdown>{content}</Markdown>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default Blog;