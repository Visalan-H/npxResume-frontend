import './App.css'
import { useState, useRef } from 'react';
import Loading from './Components/Loading/Loading'
import axios from 'axios'
import Drag from './Components/Drag/Drag';

function App() {

  const [pdf, setPdf] = useState(null);
  const [text, setText] = useState("Drop it like it's hot");
  const [dropping, setDropping] = useState(false);
  // const [username, setUsername] = useState("")
  const username = useRef("")
  const [status, setStatus] = useState("")
  const buttonRef = useRef()


  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && status !="✅ Available"){
      setPdf(file);
    }
    if (file && status == "✅ Available") {
      setPdf(file);
      buttonRef.current.disabled = false
    }
  };
  const handleSubmit = () => {
    console.log(pdf)
    if (!pdf) return;
    if (status == "❌ Taken" || !username) return;
    const formData = new FormData();
    formData.append("username", username)
    formData.append("pdfFile", pdf)
    axios.post("http://localhost:3000/add", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
      .then(() => {
        console.log("Upload successful");
      })
      .catch((err) => {
        console.error("Upload failed", err);
      });
  }

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    setDropping(true)
  })

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0].type == "pdf" || e.dataTransfer.files[0].type == "application/pdf") {
      setPdf(e.dataTransfer.files[0])
      setDropping(false)
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
    if (username.current.value.includes(" ")) {
      setStatus("No Spaces are allowed🥺")
      return;
    }
    if (username.current.value.trim() == "") {
      setStatus("Username can't be empty❌")
      return;
    }
    axios
      .get(`http://localhost:3000/user/${username.current.value}`)
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
          console.error("Error checking username:", err);
        }
      });
  }

  const handleUsernameChange = debounce(fetchUser, 500)

  // const handleUsernameChange1 = (e) => {
  //   const newUsername = e.target.value;

  //   deb(e.target.value)
  // };

  if (dropping) return <Drag text={text} />

  return (

    <div className='home_main'>
      <h1>Upload or Drag and Drop your Resume</h1>
      <h3>We will give you a npx command that displays your resume in terminal.</h3>
      <div className='input_main'>
        <label htmlFor="resume">Upload here:</label>
        <input onChange={handleChange} accept='application/pdf,.pdf' type="file" name="resumeInput" id="resume" />
      </div>
      <button disabled ref={buttonRef} onClick={handleSubmit}>Submit</button>
      <input type="text" ref={username} onChange={handleUsernameChange} />
      <p>{status}</p>
      {pdf &&
        <div className='pdf_main'>
          <h3>Name: {pdf.name}</h3>
          <h3>Size: {(pdf.size / 1024).toFixed(2) + "Kb"}</h3>
          <h3>Type: {pdf.type}</h3>
        </div>
      }
    </div>
  )
}

export default App
