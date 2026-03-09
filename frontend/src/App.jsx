import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { router } from './router'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        toastClassName="toastify-custom"
        progressClassName="toastify-progress-custom"
      />
    </>
  )
}

export default App
