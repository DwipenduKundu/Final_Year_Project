import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { Outlet } from 'react-router-dom'
import { login } from './store/authSlice'
import { Flex, Text } from '@chakra-ui/react'

function App() {

  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(true);


  const fetchCurrent = async ()=>{
    const res =  await fetch('http://localhost:8000/api/v1/users/getCurrentUser',
      {
        method:'GET',
        credentials:'include',
      }
    )
    if(!res.ok){
      
    
      return;
    }
    const data = await res.json()
    dispatch(login(data.data));
  }

  useEffect(()=>{
    setIsLoading(true);
   fetchCurrent()
   setIsLoading(false);
  },[])

  return  isLoading ? (<>

    <Flex h='100vh' w='100vw' display={'flex'} alignItems={'center'} justifyContent={'center'}>

    <Text fontSize={'3xl'}>Loading.....</Text>
    
    </Flex>  
  
  </>):(
    <Outlet/>
  )
}

export default App
