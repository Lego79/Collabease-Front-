// src/components/common/utils/EndpointUtils/CollabEase.ts
import { BASE_URL } from "../../../api/config";

const endpoint = (path: string): string => {
  // BASE_URL 마지막에 '/'가 없으면 붙여주기
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}/${path.startsWith('/') ? path.slice(1) : path}`;
};

export const CollabEase = {
  BOARD: {
    GET_ALL_BOARD: endpoint("api/tasks/paged"),
    CREATE_BOARD: endpoint("api/board"),
    UPDATE_BOARD: endpoint("api/board/update"),
    DELETE_BOARD: endpoint("api/board/delete"),
    GET_TASK_DATA: endpoint("api/tasks/task-data"),
    CREATE_COMMENT: endpoint("api/comment"),
    GET_BOARD_DETAILS: endpoint("api/board-detail"),
    DELETE_COMMENT: (commentId: string) => endpoint(`api/comment/${commentId}`),
    UPLOAD_BOARD_FILE: endpoint("api/board/file"),
    DOWNLOAD_BOARD_FILE: endpoint("api/board/file"),
  },
  MEMBER: {
    GET_MEMBER_CHAT: endpoint("api/member/chat-member"), // 닉네임으로 멤버 검색
  },
  CHAT: {
    CONVERSATIONS: endpoint("api/chat/conversations"),
    MESSAGES: (conversationId: number) => endpoint(`api/chat/conversations/${conversationId}/grouped-messages`),
    WS_URL: "http://localhost:8080/ws-stomp",
  },
};

export default { CollabEase };
