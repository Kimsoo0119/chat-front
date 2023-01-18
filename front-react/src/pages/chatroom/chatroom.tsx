import classNames from "classnames";
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { socket } from "../../App";
import { ChatContainer, LeaveButton, Message, MessageBox, MessageForm } from "./chatroom.styles";

interface IChat {
  userNo: string;
  chatRoomNo: string;
  message: string;
}

const ChatRoom = () => {
  const [chats, setChats] = useState<IChat[]>([]);
  const [message, setMessage] = useState<string>("");
  const chatContainerEl = useRef<HTMLDivElement>(null);

  const { roomName } = useParams<"roomName">();
  const navigate = useNavigate();

  const location = useLocation();
  const state = location.state as { userNo: string };
  const userNo = state.userNo;
  socket.id = userNo;
  console.log(socket);

  // 채팅이 길어지면(chats.length) 스크롤이 생성되므로, 스크롤의 위치를 최근 메시지에 위치시키기 위함
  useEffect(() => {
    if (!chatContainerEl.current) return;

    const chatContainer = chatContainerEl.current;
    const { scrollHeight, clientHeight } = chatContainer;

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  }, [chats.length]);

  // message event listener
  useEffect(() => {
    const messageHandler = (chat: IChat) => setChats((prevChats) => [...prevChats, chat]);
    socket.on("message", messageHandler);

    return () => {
      socket.off("message", messageHandler);
    };
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);
  // const a: IChat = {
  //   username: string,
  //   chatRoomNo: 1,
  //   message: "a",
  // };
  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message) return alert("메시지를 입력해 주세요.");
      socket.emit("message", { userNo, chatRoomNo: 18, message }, (chats: IChat) => {
        setChats((prevChats) => [...prevChats, chats]);
        setMessage("");
      });
    },
    [message, roomName]
  );

  const onLeaveRoom = useCallback(() => {
    socket.emit("leave-room", roomName, () => {
      navigate("/");
    });
  }, [navigate, roomName]);

  return (
    <>
      <h1>모던 애자일 사랑방</h1>
      <LeaveButton onClick={onLeaveRoom}>방 나가기</LeaveButton>
      <ChatContainer ref={chatContainerEl}>
        {chats.map((chat, index) => (
          <MessageBox
            key={index}
            className={classNames({
              my_message: socket.id === chat.userNo,
              alarm: !chat.userNo,
            })}
          >
            <span>{chat.userNo ? (socket.id === chat.userNo ? "" : chat.userNo) : ""}</span>
            <Message className="message">{chat.message}</Message>
          </MessageBox>
        ))}
      </ChatContainer>
      <MessageForm onSubmit={onSendMessage}>
        <input type="text" onChange={onChange} value={message} />
        <button>보내기</button>
      </MessageForm>
    </>
  );
};

export default ChatRoom;
