import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Head, Table } from "./waiting-room.styles";
import { socket } from "../../App";

export interface ChatRooms {
  rooms: number[];
  chatRoomNo?: number;
  roomName: string;
}

interface CreateRoomResponse {
  success: boolean;
  payload: string;
  response: ChatRooms;
}

interface Room {
  chatRoomNo: number;
  roomName: string;
  chatROomUsers: number[];
}

const userNo = prompt("유저 번호");

const WaitingRoom = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const roomListHandler = ({ response }: any) => {
      console.log(response);

      const chatRoom: Room[] = response.chatRooms;
      setRooms(chatRoom);
    };
    const createRoomHandler = (newRoom: any) => {
      setRooms((prevRooms) => [...prevRooms, newRoom]);
    };
    // const deleteRoomHandler = (boardNo: number) => {
    //   setRooms((prevRooms) => prevRooms.filter((room) => room !== boardNo));
    // };

    socket.emit("init-socket", roomListHandler);
    socket.on("init-socket", createRoomHandler);
    socket.on("create-room", createRoomHandler);

    // socket.on("delete-room", deleteRoomHandler);

    return () => {
      socket.off("init-socket", createRoomHandler);
      // socket.off("delete-room", deleteRoomHandler);
    };
  }, []);

  const onCreateRoom = useCallback(() => {
    const boardNo = prompt("게시글 번호");

    if (!boardNo) return alert("방 이름은 반드시 입력해야 합니다.");

    socket.emit("create-room", { boardNo }, ({ response }: CreateRoomResponse) => {
      navigate(`/room/${response.chatRoomNo}`, {
        state: { userNo: userNo, roomName: response.roomName },
      });
    });
  }, [navigate]);

  const onJoinRoom = useCallback(
    (chatRoomNo: number, roomName: string) => () => {
      console.log(roomName);

      navigate(`/room/${chatRoomNo}`, { state: { userNo, chatRoomNo, roomName } });
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
            <tr key={room.chatRoomNo}>
              <td>{room.chatRoomNo}</td>
              <td>{room.roomName}</td>
              <td>
                <button onClick={onJoinRoom(room.chatRoomNo, room.roomName)}>입장하기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default WaitingRoom;
