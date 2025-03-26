import './App.css'
import { useState, useRef, useEffect } from 'react';
import Loading from './Components/Loading/Loading'
import axios from 'axios'
import Drag from './Components/Drag/Drag';
import { ToastContainer, toast } from 'react-toastify';

function App() {

  const [pdf, setPdf] = useState(null);
  const [text, setText] = useState("Drop it like it's hot");
  const [dropping, setDropping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false)
  const [position, setPosition] = useState([0, 0])
  const [usernamee, setUsernamee] = useState("")
  const username = useRef("")
  const [status, setStatus] = useState("")
  const buttonRef = useRef()


  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && status != "✅ Available") {
      setPdf(file);
    }
    if (file && status == "✅ Available") {
      setPdf(file);
      buttonRef.current.disabled = false
    }
  };
  const handleSubmit = () => {
    // console.log(pdf)
    if (!pdf) return;
    if (status == "❌ Taken" || !username.current.value) return;
    toast('Please wait while we load')
    setTimeout(() => {
      setLoading(true)
    }, 3000)
    const formData = new FormData();
    formData.append("username", username.current.value)
    formData.append("pdfFile", pdf)
    // setLoading(true);
    axios.post(`${import.meta.env.VITE_BASE_URL}/add`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
      .then((res) => {
        // console.log(res)
        setUsernamee(res.data.username)
        setLoading(false);
        setDone(true);
        // console.log("Upload successful");
      })
      .catch((err) => {
        toast('Error!')
        setLoading(false);
        // console.error("Upload failed", err);
      });
  }

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    setDropping(true)
    // console.log(e.dataTransfer.files[0])
  })

  document.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0].type == "pdf" || e.dataTransfer.files[0].type == "application/pdf") {
      setPdf(e.dataTransfer.files[0])
      setPosition([e.clientX, e.clientY])
      setTimeout(() => {
        setDropping(false)
        setPosition([0, 0])
      }, 1200)
    }
    else {
      setText("Only Pdf's are allowed")
    }
  })

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  const fetchUser = () => {
    // console.log("fetch")
    if (username.current.value.includes(" ")) {
      setStatus("No Spaces are allowed🥺")
      return;
    }
    if (username.current.value.trim() == "") {
      setStatus("Username can't be empty❌")
      return;
    }
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/user/${username.current.value}`)
      .then((res) => {
        setStatus(res.data.available === "yes" ? "✅ Available" : "❌ Taken");
        if (res.data.available === "yes" && pdf) {
          buttonRef.current.disabled = false
        }
        else {
          buttonRef.current.disabled = true
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          console.log("Request canceled");
        } else {
          console.error("Error checking if username exists");
        }
      });
  }

  const handleUsernameChange = debounce(fetchUser, 500)

  const handleCopy = () => {
    navigator.clipboard.writeText(`npx @vizzalan/npx-resume ${usernamee}`);
    toast('Copied to clipboard!')
  }

  if (dropping) return <Drag position={position} text={text} />
  if (done) return <div className="done_main">
    <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      pauseOnFocusLoss
      draggable
      theme="dark"
    />
    <h2>Copy Paste this command in your terminal</h2>
    <h1 className='userselect'>npx @vizzalan/npx-resume {usernamee} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i onClick={handleCopy} title='copy' className='fa fa-copy'></i></h1>
  </div>
  if (loading) return <Loading />

  return (

    <div className='home_main'>
      <h1>Upload or Drag and Drop your Resume</h1>
      <h3>We will give you a npx command that displays your resume in terminal.</h3>
      <div className="userandfile">
        <div className='inputt file'>
          <label htmlFor="resume">Upload here:</label>
          <input onChange={handleChange} accept='application/pdf,.pdf' type="file" name="resumeInput" id="resume" className='userselect'/>
          <i className="fa-solid fa-cloud-arrow-up"></i>
        </div>
        <div className='inputt username'>
          <label htmlFor="namee">Enter Username</label>
          <input maxLength={30} id='namee' type="text" ref={username} onChange={handleUsernameChange} />
          <p>{status}</p>
        </div>
      </div>
      <button ref={buttonRef} onClick={handleSubmit}>Submit</button>
      {pdf &&
        <div className='pdf_main'>
          <h3>Name: {pdf.name}</h3>
          <h3>Size: {(pdf.size / 1024).toFixed(2) + "Kb"}</h3>
          <h3>Type: {pdf.type}</h3>
        </div>
      }
      {!pdf &&
        <div className="nopdf_main">
          <h2>Command: npx @vizzalan/npx-resume &lt;username&gt;</h2>
        </div>
      }
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        pauseOnFocusLoss
        draggable
        theme="dark"
      />

    </div>
  )
}

export default App
