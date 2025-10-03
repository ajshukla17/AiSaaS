import Home from './pages/Home'
import Layout from './pages/Layout';

import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import WriteArtcle from './pages/WriteArticle';
import Blog from './pages/Blog';
import Dashboard from './pages/Dashboard';
import GenrateImages from './pages/GenrateImages';
import RemoveBackground from './pages/RemoveBackground';
import RemoveObject from './pages/RemoveObject';
import ReviewResume from './pages/ReviewResume';
import Community from './pages/Community';
import { useAuth } from '@clerk/clerk-react';
import {Toaster} from 'react-hot-toast'

function App() {
  
  

  return (
    <div>
      <Toaster />
      <Routes>
        <Route index element={<Home />} />
        <Route path='/ai' element={<Layout />} >
          <Route index element={<Dashboard />} />
          <Route path='write-article' element={<WriteArtcle />} />
          <Route path='blog' element={<Blog />} />
          <Route path='generate-images' element={<GenrateImages />} />
          <Route path='remove-background' element={<RemoveBackground />} />
          <Route path='remove-object' element={<RemoveObject />} />
          <Route path='review-resume' element={<ReviewResume />} />
          <Route path='community' element={<Community />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;