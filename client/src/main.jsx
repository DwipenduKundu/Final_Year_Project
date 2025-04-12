import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import  {createBrowserRouter, RouterProvider} from "react-router-dom"
import { ChakraProvider } from '@chakra-ui/react'
import {Provider} from 'react-redux'

import Home from './pages/Home.jsx'
import store from './store/store.js'
import Chat from './pages/Chat.jsx'
import Quiz from './pages/Quiz.jsx'
import Wikipedia from './pages/Wikipedia.jsx'
import Youtube from './pages/Youtube.jsx'
import LoginSignup from './components/LoginSignup.jsx'
import Dashboard from './pages/Home.jsx'
import UserSettings from './pages/UserSettings.jsx'
import OtpVerification from './components/OtpVerfication.jsx'


const router = createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
      {
        path:'/',
        element:<Home/>
      },
      {
        path:'/chat',
        element:<Chat/>
      },
      {
        path:'/youtube-recommendation',
        element:<Youtube/>,
      },
      {
        path:'/wikipedia-search',
        element:<Wikipedia/>
      },{
        path:"/quiz",
        element:<Quiz/>
      },
      {
        path:"/authentication/:type",
        element:<LoginSignup/>
      },
      {
        path:"/otpVerification/:email",
        element:<OtpVerification/>
      },
      {
        path:'/userSettings',
        element:<UserSettings/>,
      }
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <ChakraProvider>
      <RouterProvider router={router}/>
    </ChakraProvider>
    </Provider>
  </StrictMode>,
)
