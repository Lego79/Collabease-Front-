import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete
} from '@mui/material';
import { CollabEase } from '../../components/common/utils/EndpointUtils';

// 서버 응답 형식과 동일하게 인터페이스 정의
// 예: { "taskId": "...", "title": "...", ... }
interface TaskItem {
  taskId: string;   // 서버에서 오는 키와 동일
  title: string;    // 제목 필드
  // 필요한 필드가 있다면 추가
}

// 부모 컴포넌트에서 onClose, onBoardCreated 함수를 props로 전달
interface CreateBoardDialogProps {
  onClose: () => void;
  onBoardCreated: () => void;
}

const CreateBoardDialog: React.FC<CreateBoardDialogProps> = ({ onClose, onBoardCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [taskList, setTaskList] = useState<TaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // 컴포넌트 마운트 시 Task 목록 불러오기
  useEffect(() => {
    axiosInstance
      .get<TaskItem[]>(CollabEase.BOARD.GET_TASK_DATA) // 예: "/api/board/task-data"
      .then((response) => {
        // response.data 예시:
        // [
        //   { taskId: "abc-123", title: "사용자 인증 API 구현", ... },
        //   { taskId: "def-456", title: "새로운 로그인 페이지 디자인", ... }
        // ]
        console.log("response.data= ", response.data);
        setTaskList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching task list:", error);
      });
  }, []);

  // 새 게시글 생성
  const handleCreate = () => {
    // 서버가 기대하는 필드명대로 맞춰서 전송
    const createRequest = {
      title: title,
      content: content,
      taskId: selectedTask?.taskId, // 선택된 Task의 UUID (taskId)
    };

    console.log("createRequest=", createRequest);

    axiosInstance
      .post(CollabEase.BOARD.CREATE_BOARD, createRequest)
      .then((response) => {
        // 생성 성공 후 부모 컴포넌트에 알림
        onBoardCreated();
      })
      .catch((error) => {
        console.error("Error creating board:", error);
      });
  };

  return (
    <>
      <DialogTitle>새 게시글 생성</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="제목"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="내용"
          fullWidth
          multiline
          rows={5}
          margin="normal"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Task 선택 자동완성 */}
        <Autocomplete
          options={taskList}
          getOptionLabel={(option) => option.title} // TaskItem의 title 필드
          value={selectedTask}
          onChange={(event, newValue) => setSelectedTask(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Task 선택" margin="normal" />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleCreate}>
          생성
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateBoardDialog;
