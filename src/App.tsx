import ExplorerPage from './pages/ExplorerPage/Explorer.jsx';
import Home from './pages/HomePage/Home.jsx';
import Login from './pages/LoginPage/Login.jsx';
import "./global.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CodeEditor from './pages/CodeEditorPage/CodeEditor.jsx';
import UploadFile from './pages/UploadFilePage/UploadFile.jsx';
import NoPage from './pages/NoPage.jsx';
import Recovery from './pages/Recovery/Recovery.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="explorer" >
            <Route index element={<NoPage />} />
            <Route path=':path' element={<ExplorerPage />} />
          </Route>
          <Route path="recovery" >
            <Route index element={<Recovery />} />
          </Route>
          <Route path="editor" >
            <Route index element={<NoPage />} />
            <Route path=':path' element={<CodeEditor />} />
          </Route>
          <Route path="upload" >
            <Route index element={<NoPage />} />
            <Route path=':path' element={<UploadFile />} />
          </Route>
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
