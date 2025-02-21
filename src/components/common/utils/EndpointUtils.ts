// CollabEase.ts
import { BASE_URL } from "../../../api/config";

const endpoint = (path: string): string => `${BASE_URL}${path}`;

export const CollabEase = {
  BOARD: {
    GET_ALL_BOARD: endpoint("api/tasks"),
    CREATE_BOARD: endpoint("api/board"),
    GET_TASK_DATA: endpoint("api/tasks/task-data"),
    CREATE_COMMENT: endpoint("api/comment"),
    GET_BOARD_DETAILS: endpoint("api/board-detail"),
    DELETE_COMMENT: (commentId: string) => endpoint(`api/comment/${commentId}`),
    // 파일 업로드용 엔드포인트 (이미지/기타파일 모두 사용 가능)
    UPLOAD_BOARD_FILE: endpoint("api/board/file"),
  },
};

export default { CollabEase };
