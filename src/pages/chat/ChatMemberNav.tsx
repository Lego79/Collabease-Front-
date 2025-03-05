// src/pages/ChatPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { decodeToken } from '../../components/common/utils/tokenUtils';

// 메시지 전송에 사용될 인터페이스
interface MessageRequest {
  memberId: string;       // 메시지 보낸 사람의 ID (UUID)
  userNickname: string;   // 메시지 보낸 사람의 닉네임
  content: string;        // 메시지 내용
  timestamp: string;      // 메시지 전송 시간 (ISO-8601 형식)
  roomId: string;         // 채팅방 식별자 (ex. 개인 채팅은 sender, receiver 조합)
}

// 채팅 멤버 인터페이스 (검색 결과)
interface ChatMember {
  memberId: string;
  nickname: string;
}

// 좌측의 채팅 멤버 네비게이션 컴포넌트 (검색 및 선택)
const ChatMemberNav: React.FC<{ onSelectMember: (member: ChatMember) => void }> = ({ onSelectMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<ChatMember[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/member/chat-member?nickname=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        }
      } catch (error) {
        console.error('채팅 멤버 검색 에러:', error);
      }
    };

    // 간단한 디바운스 로직 (300ms 지연)
    const debounceTimeout = setTimeout(() => {
      fetchMembers();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  return (
    <div style={{ padding: '1rem', borderRight: '1px solid #ccc', height: '100%', boxSizing: 'border-box' }}>
      <input 
        type="text" 
        placeholder="닉네임 검색" 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {members.map((member) => (
          <li 
            key={member.memberId} 
            style={{ padding: '0.5rem', cursor: 'pointer' }} 
            onClick={() => onSelectMember(member)}
          >
            {member.nickname}
          </li>
        ))}
      </ul>
    </div>
  );
};

// 메인 채팅 페이지 컴포넌트
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageRequest[]>([]);
  const [input, setInput] = useState<string>('');
  const stompClientRef = useRef<any>(null);

  // 로컬 스토리지의 토큰을 디코딩하여 내 정보를 가져옴
  const token = localStorage.getItem('accessToken');
  const decoded: any = token ? decodeToken(token) : null;
  const memberId: string = decoded?.memberId || '';
  const userNickname: string = decoded?.userNickname || '익명';

  // 선택된 채팅 상대와 방 식별자 관리
  const [selectedMember, setSelectedMember] = useState<ChatMember | null>(null);
  const [roomId, setRoomId] = useState<string>('default-room');

  useEffect(() => {
    // 1. SockJS를 이용해 STOMP 클라이언트 연결
    const socket = new SockJS('http://localhost:8080/ws-stomp');
    const client = Stomp.over(() => socket);
    stompClientRef.current = client;

    // 2. STOMP 서버에 연결
    client.connect({}, () => {
      console.log('STOMP connected');
    
      // 3. 특정 토픽 구독 (예: /topic/chat)
      client.subscribe('/topic/chat', (messageFrame: any) => {
        const payload = JSON.parse(messageFrame.body);
        setMessages(prev => [...prev, payload]);
      });
    }, (error: unknown) => {
      console.error('STOMP connection error', error);
    });
    
    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
          console.log('STOMP disconnected');
        });
      }
    };
  }, []);

  // 메시지 보내기 핸들러 (MessageRequest 인터페이스에 맞게 데이터 구성)
  const sendMessage = () => {
    if (!input.trim() || !stompClientRef.current) return;

    // 만약 개인 채팅이라면 선택된 멤버와의 roomId 생성 로직(예: 두 ID를 정렬하여 조합)
    const currentRoomId = roomId;

    const messageRequest: MessageRequest = {
      memberId: memberId,
      userNickname: userNickname,
      content: input.trim(),
      timestamp: new Date().toISOString(),
      roomId: currentRoomId
    };

    // STOMP 서버로 메시지 전송 (JSON 형태로 전송)
    stompClientRef.current.send('/app/chat', {}, JSON.stringify(messageRequest));
    setInput('');  // 메시지 전송 후 입력창 초기화
  };

  // 채팅 대상 선택 핸들러
  const handleSelectMember = (member: ChatMember) => {
    setSelectedMember(member);
    // 예시 roomId 생성: sender, receiver의 memberId를 정렬 후 '-'로 조합
    const newRoomId = [memberId, member.memberId].sort().join('-');
    setRoomId(newRoomId);
    setMessages([]); // 방 전환 시 기존 메시지 초기화(필요 시 해당 방의 메시지를 백엔드 API로 로드)
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 좌측 사용자 네비게이션 (30%) */}
      <div style={{ flex: 3, borderRight: '1px solid #ccc' }}>
        <ChatMemberNav onSelectMember={handleSelectMember} />
      </div>
      {/* 우측 채팅창 (70%) */}
      <div style={{ flex: 7, display: 'flex', flexDirection: 'column' }}>
        <div 
          id="chat-window" 
          style={{ flex: 1, borderBottom: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}
        >
          {messages.map((msg, idx) => (
            <p key={idx}>
              <strong>{msg.userNickname}:</strong> {msg.content}
            </p>
          ))}
        </div>
        <div id="chat-input" style={{ padding: '1rem', display: 'flex' }}>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="메시지를 입력하세요" 
            style={{ flex: 1, padding: '0.5rem' }}
          />
          <button onClick={sendMessage} style={{ marginLeft: '0.5rem' }}>전송</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
