import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Head, Table } from "./waiting-room.styles";
import { io } from "socket.io-client";
import { socket } from "../../App";

export interface ChatRooms {
  rooms: number[];
  chatRoomNo?: number;
}

interface CreateRoomResponse {
  success: boolean;
  payload: string;
  response: ChatRooms;
}
interface Response {
  chatRooms: number;
}

const WaitingRoom = () => {
  const [rooms, setRooms] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const roomListHandler = (rooms: number[]) => {
      setRooms(rooms);
    };
    const createRoomHandler = (newRoom: number) => {
      setRooms((prevRooms) => [...prevRooms, newRoom]);
    };
    const deleteRoomHandler = (boardNo: number) => {
      setRooms((prevRooms) => prevRooms.filter((room) => room !== boardNo));
    };

    // socket.emit("init-socket", roomListHandler);
    socket.on("init-socket", createRoomHandler);
    socket.on("delete-room", deleteRoomHandler);

    return () => {
      socket.off("init-socket", createRoomHandler);
      socket.off("delete-room", deleteRoomHandler);
    };
  }, []);

  const onCreateRoom = useCallback(() => {
    const boardNo = prompt("방 이름을 입력해 주세요.");
    const userNo = prompt("유저 no");

    if (!boardNo) return alert("방 이름은 반드시 입력해야 합니다.");

    socket.emit("init-socket", { userNo }, ({ response }: CreateRoomResponse) => {
      navigate(`/room/${response.chatRoomNo}`, { state: { userNo: userNo } });
    });
  }, [navigate]);

  const onJoinRoom = useCallback(
    (chatRoomNo: number) => () => {
      socket.emit("join-room", { chatRoomNo }, ({ response }: CreateRoomResponse) => {
        navigate(`/room/${response.chatRoomNo}`);
      });
    },
    [navigate]
  );

  return (
    <>
      <Head>
        <div>채팅방 목록</div>
        <button onClick={onCreateRoom}>채팅방 생성</button>
      </Head>

      <Table>
        <thead>
          <tr>
            <th>방번호</th>
            <th>방이름</th>
            <th>입장</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={room}>
              <td>{index + 1}</td>
              <td>{room}</td>
              <td>
                <button onClick={onJoinRoom(room)}>입장하기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default WaitingRoom;
