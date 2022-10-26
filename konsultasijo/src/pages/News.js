import React,{useRef,useState,useEffect} from "react";
import Navigation from "../components/Navigation";
import '../assets/news.css';
import ImgDeleteUser from '../assets/deleteUser.svg';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref as databaseRef,set,onValue } from "firebase/database";
import { getStorage, ref,uploadBytesResumable,getDownloadURL } from "firebase/storage";
import app from '../configs/firebase'

const split={
    display: 'flex',
    flexDirection: 'row',
}
const News = () => {
  const judul = useRef('')
  const link = useRef('')
  const [file,setFile] = useState(null)
  const [percent, setPercent] = useState(0);
  const [news,setNews] = useState([])

  const writeUserData = ()=>{
    const storage = getStorage(app)
    if (!file) return;

    const storageRef = ref(storage,`images/${file.name}`)

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercent(progress)
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
          default:
           console.log('not running');
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const datas={
            id:uuidv4(),
            judul:judul.current.value,
            link:link.current.value,
            image:downloadURL
          }
        const db = getDatabase(app);
            set(databaseRef(db, 'news/'+datas.id), datas);
        });
        // setFile(null)
        // setImgUrl(null)
      }
    );
  }

  const fileChange = (e)=>{
    e.preventDefault()
    setFile(e.target.files[0])
  }

  const GetNews = ()=>{
    const db = getDatabase(app)
    const dbRef = databaseRef(db,'news/');
    onValue(dbRef, (snapshot) => {
      setNews(Object.values(snapshot.val()));
    });
  }
  useEffect(()=>{
    GetNews()
  },[])
  // console.log(imgUrl);
    return(
        <div style={split}>
         <Navigation/>
         <div className="gap">

          {/* Masukan Judul */}
          <div class="input-group flex-nowrap mb-2" style={{display: 'flex',}}>
            <input type="text" class="form-control" placeholder="Masukan Judul" ref={judul}/>
          </div>

          {/* Masukan Link */}
          <div class="input-group flex-nowrap mb-2">
            <input type="text" class="form-control" placeholder="Masukan Link" ref={link}/>
          </div>

          {/* Masukan Gambar */}
          <div class="input-group flex-nowrap mb-2">
            <input type="file" accept="/image/*" class="form-control" placeholder="Masukan Gambar" onChange={fileChange}/>
          </div>

          <div class="col-auto">
            <button class="btn btn-danger mb-3 form-control" onClick={writeUserData}>Posting</button>
          </div>
          <p>{percent} % done</p>
          <div className="wrapper">
              {news.map((item,index)=>(
                <div key={index} className="newsWrapper" style={{display: 'flex'}}>
                    <p>{item.judul}</p>
                    <a href={item.image} rel="noopener noreferrer" target="_blank">
                      <img  src={item.image} alt="News" className="imgberita" target="_blank"/>
                    </a>
                    <img className="imgbutton" style={{}} type="button" onClick={()=> alert('testnews')} src={ImgDeleteUser} alt="DeleteAccount" />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
}

export default News;
