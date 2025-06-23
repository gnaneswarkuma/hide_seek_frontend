import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoomManager } from "./Home";
import App from "./App";
import { Winner } from "./Contant/Winner";
export default function Entry() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoomManager/>} />
        <Route path="/game" element={<App/>} />
        <Route path="/winner" element={<Winner/>}/>
      </Routes>
    </BrowserRouter>
  );
}
