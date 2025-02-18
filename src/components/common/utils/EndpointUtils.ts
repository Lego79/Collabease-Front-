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
    // DELETE_COMMENT를 함수형으로 변경
    // => 최종적으로 DELETE /api/comment/{commentId} 형태의 URL이 만들어짐
      DELETE_COMMENT: (commentId: string) => endpoint(`api/comment/${commentId}`),
    },
    CONFIGURATION: {
        PUBLIC: {
        },
        USER_REGISTRATION: {
        }
    },


};

export default { CollabEase };
