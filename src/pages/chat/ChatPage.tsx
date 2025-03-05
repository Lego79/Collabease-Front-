import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp, CompatClient } from '@stomp/stompjs';
import { decodeToken } from '../../components/common/utils/tokenUtils';
import { CollabEase } from '../../components/common/utils/EndpointUtils';
import apiClient from '../../components/common/utils/ApiClient';

export interface ChatMember {
  memberId: string;
  username: string;
}

export interface ConversationResponse {
  conversationId: number;
  participants: string[];
  createdAt: string;
}

export interface MessageResponse {
  messageId: number;
  conversationId: number;
  senderUsername: string; // 백엔드에서 넘어오는 전송자 username
  senderNickname: string; 
  content: string;
  timestamp: string;
}

/**
 * 멤버 검색 컴포넌트
 */
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
        const response = await apiClient.get(CollabEase.MEMBER.GET_MEMBER_CHAT, {
          params: { username: searchTerm }
        });
        setMembers(response.data);
      } catch (error) {
        console.error('채팅 멤버 검색 에러:', error);
      }
    };
    const debounceTimeout = setTimeout(() => { fetchMembers(); }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);
  
  return (
    <div style={styles.navContainer}>
      <input 
        type="text" 
        placeholder="사용자 검색" 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        style={styles.searchInput}
      />
      <ul style={styles.memberList}>
        {members.map((member) => (
          <li 
            key={member.memberId} 
            style={styles.memberListItem}
            onClick={() => onSelectMember(member)}
          >
            {member.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * 메인 채팅 페이지
 */
const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  // STOMP 연결 상태
  const [stompConnected, setStompConnected] = useState<boolean>(false);
  const stompClientRef = useRef<CompatClient | null>(null);

  // 현재 사용자 정보 (토큰에 username 포함 가정)
  const token = localStorage.getItem('accessToken');
  const decoded: any = token ? decodeToken(token) : null;
  // 공백/대소문자 제거
  const currentUsername: string = (decoded?.userName || '익명').trim().toLowerCase();

  // 대화방 목록 조회
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get(CollabEase.CHAT.CONVERSATIONS);
      setConversations(response.data);
    } catch (error) {
      console.error("대화방 목록 조회 에러:", error);
    }
  };

  // WebSocket 연결 설정
  useEffect(() => {
    const socket = new SockJS(CollabEase.CHAT.WS_URL);
    const client = Stomp.over(() => socket);
    stompClientRef.current = client;
    client.connect(
      { "Authorization": `Bearer ${token}` },
      () => {
        console.log("STOMP connected");
        setStompConnected(true);
        if (activeConversation) {
          subscribeToConversation(activeConversation.conversationId);
        }
      },
      (error: any) => {
        console.error("STOMP connection error", error);
      }
    );
    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect(() => {
          console.log('STOMP disconnected');
        });
      }
    };
  }, [token]);

  // activeConversation 및 연결 상태 변경 시 재구독
  useEffect(() => {
    if (stompConnected && activeConversation) {
      subscribeToConversation(activeConversation.conversationId);
      fetchMessages(activeConversation.conversationId, 1, 20);
    }
  }, [stompConnected, activeConversation]);

  const subscribeToConversation = (conversationId: number) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn("STOMP client not connected, cannot subscribe");
      return;
    }
    const destination = `/topic/conversations/${conversationId}`;
    stompClientRef.current.subscribe(destination, (messageFrame: any) => {
      const payload: MessageResponse = JSON.parse(messageFrame.body);
      setMessages(prev => [...prev, payload]);
    });
  };

  const fetchMessages = async (conversationId: number, page: number, size: number) => {
    setLoadingMessages(true);
    try {
      const response = await apiClient.get(CollabEase.CHAT.MESSAGES(conversationId), {
        params: { page, size }
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('메시지 조회 에러:', error);
    }
    setLoadingMessages(false);
  };

  const sendMessage = () => {
    if (!input.trim() || !stompClientRef.current || !activeConversation) return;
    const conversationId = activeConversation.conversationId;
    stompClientRef.current.send(
      `/app/chat-ws/${conversationId}`,
      { "Authorization": `Bearer ${token}` },
      input.trim()
    );
    setInput('');
  };

  // 기존 대화방 선택
  const handleSelectConversation = (conversation: ConversationResponse) => {
    setActiveConversation(conversation);
  };

  // 새 대화방 생성(상대방 선택)
  const handleSelectMember = async (member: ChatMember) => {
    try {
      const response = await apiClient.post(CollabEase.CHAT.CONVERSATIONS, {
        participantUsername: member.username 
      });
      const conv: ConversationResponse = response.data;
      setActiveConversation(conv);
      fetchConversations();
    } catch (error) {
      console.error('대화방 생성 에러:', error);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${ampm} ${hours}:${formattedMinutes}`;
  };

  return (
    <div style={styles.container}>
      {/* 왼쪽 사이드바 */}
      <div style={styles.sidebar}>
        <h3 style={{ textAlign: 'center' }}>대화방 목록</h3>
        <ul style={styles.conversationList}>
          {conversations.map((conv) => (
            <li 
              key={conv.conversationId} 
              style={styles.conversationListItem}
              onClick={() => handleSelectConversation(conv)}
            >
              {conv.participants.join(', ')}
            </li>
          ))}
        </ul>
        <hr style={{ margin: '1rem 0' }}/>
        <h3 style={{ textAlign: 'center' }}>멤버 검색</h3>
        <ChatMemberNav onSelectMember={handleSelectMember} />
      </div>

      {/* 오른쪽 채팅 영역 */}
      <div style={styles.chatWrapper}>
        <div style={styles.chatHeader}>
          {activeConversation 
            ? activeConversation.participants.join(', ') + " 대화"
            : '대화방을 선택하거나 새 대화를 시작하세요'}
        </div>
        <div style={styles.chatWindow}>
        {messages.map((msg, idx) => {
              console.log('디버그: currentUsername=', currentUsername, 
              'senderUsername=', msg.senderUsername.trim().toLowerCase(),
              'isMyMessage=', (msg.senderUsername.trim().toLowerCase() === currentUsername));          
          const isMyMessage = msg.senderUsername.trim().toLowerCase() === currentUsername;
          const formattedTime = formatTimestamp(msg.timestamp);
          
          if (isMyMessage) {
            return (
              <div key={idx} style={styles.myMessageContainer}>
                <div style={styles.myMessageBubble}>
                  <span style={styles.myMessageTime}>[{formattedTime}]</span>
                  <span style={styles.myMessageContent}> {msg.content}</span>
                </div>
              </div>
            );
          } else {
            return (
              <div key={idx} style={styles.otherMessageContainer}>
                <div style={styles.otherMessageInfo}>{msg.senderUsername}</div>
                <div style={styles.otherMessageBubble}>
                  <span style={styles.otherMessageContent}>{msg.content}</span>
                  <span style={styles.otherMessageTime}>[{formattedTime}]</span>
                </div>
              </div>
            );
          }
        })}
      </div>

        {/* 메시지 입력란 */}
        <div style={styles.chatInputContainer}>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="메시지를 입력하세요" 
            style={styles.chatInput}
          />
          <button onClick={sendMessage} style={styles.sendButton}>전송</button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh'
  },
  sidebar: {
    width: '25%',
    borderRight: '1px solid #ccc',
    padding: '1rem',
    boxSizing: 'border-box'
  },
  conversationList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  conversationListItem: {
    padding: '0.5rem',
    cursor: 'pointer',
    borderBottom: '1px solid #eee'
  },
  navContainer: {
    marginTop: '1rem'
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem',
    boxSizing: 'border-box'
  },
  memberList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  memberListItem: {
    padding: '0.5rem',
    cursor: 'pointer',
    borderBottom: '1px solid #eee'
  },
  chatWrapper: {
    width: '75%',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    boxSizing: 'border-box'
  },
  chatHeader: {
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  // 채팅 내용이 쌓이는 메인 영역
  chatWindow: {
    flex: 1,
    display: 'flex',         // 메시지 쌓임
    flexDirection: 'column', // 세로 방향
    overflowY: 'auto',
    marginBottom: '1rem',
    padding: '0.5rem',
    border: '1px solid #ccc'
  },
  // 내 메시지(오른쪽)
  myMessageContainer: {
    display: 'flex',
    justifyContent: 'flex-end', 
    marginBottom: '0.5rem',
    width: '100%'
  },
  myMessageBubble: {
    backgroundColor: '#87CEFA',
    padding: '0.5rem',
    borderRadius: '10px',
    maxWidth: '60%',
    marginRight: '0.5rem',
    whiteSpace: 'pre-wrap'
  },
  myMessageTime: {
    fontSize: '0.75rem',
    color: '#333'
  },
  myMessageContent: {
    marginLeft: '0.3rem'
  },
  otherMessageContainer: {
    display: 'flex',
    flexDirection: 'column',  // 닉네임 정보, 말풍선 세로 정렬
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    width: '100%'
  },
  otherMessageInfo: {
    fontSize: '0.75rem',
    color: '#555',
    marginLeft: '0.5rem'
  },
  otherMessageBubble: {
    backgroundColor: '#FFF',
    padding: '0.5rem',
    borderRadius: '10px',
    border: '1px solid #ccc',
    maxWidth: '60%',
    marginLeft: '0.5rem',
    whiteSpace: 'pre-wrap'
  },
  otherMessageContent: {
    display: 'inline-block'
  },
  otherMessageTime: {
    display: 'inline-block',
    fontSize: '0.75rem',
    color: '#555',
    marginLeft: '0.3rem'
  },
  chatInputContainer: {
    display: 'flex'
  },
  chatInput: {
    flex: 1,
    padding: '0.5rem'
  },
  sendButton: {
    padding: '0.5rem 1rem'
  }
};

export default ChatPage;
