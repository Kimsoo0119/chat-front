import { Route, Routes } from "react-router-dom";
import Chatroom from "./pages/chatroom/chatroom";
import WaitingRoom from "./pages/waiting-room/waiting-room";
import { io } from "socket.io-client";

function getToken() {
  const token = prompt("토큰?");
  if (!token) {
    alert("경고@");
  }
  return token;
}
const URL = process.env.REACT_APP_MAIN_SERVER as string;
// 웹소켓 연결 및 소켓 인스턴스 생성
export let socket = io(URL, {
  auth: {
    token: getToken(),
  },
});

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WaitingRoom />} />
      <Route path="/room/:roomName" element={<Chatroom />} />
    </Routes>
  );
};

export default App;
