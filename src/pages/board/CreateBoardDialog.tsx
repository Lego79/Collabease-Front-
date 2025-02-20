import React, { useState, useEffect, useRef } from 'react';
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
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

// 서버 응답 형식과 동일하게 인터페이스 정의
interface TaskItem {
  taskId: string;
  title: string;
  // 필요한 필드가 있다면 추가
}

interface CreateBoardDialogProps {
  onClose: () => void;
  onBoardCreated: () => void;
}

const CreateBoardDialog: React.FC<CreateBoardDialogProps> = ({ onClose, onBoardCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [taskList, setTaskList] = useState<TaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Toast UI Editor의 참조 생성
  const editorRef = useRef<any>(null);

  // 컴포넌트 마운트 시 Task 목록 불러오기
  useEffect(() => {
    axiosInstance
      .get<TaskItem[]>(CollabEase.BOARD.GET_TASK_DATA)
      .then((response) => {
        console.log("response.data= ", response.data);
        setTaskList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching task list:", error);
      });
  }, []);

  // 새 게시글 생성 함수
  const handleCreate = () => {
    // 최신 에디터 값을 content 상태에 반영
    if (editorRef.current) {
      const instance = editorRef.current.getInstance();
      const markdownContent = instance.getMarkdown();
      setContent(markdownContent);
    }

    const createRequest = {
      title: title,
      content: content,
      taskId: selectedTask?.taskId,
    };

    console.log("createRequest=", createRequest);

    axiosInstance
      .post(CollabEase.BOARD.CREATE_BOARD, createRequest)
      .then((response) => {
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

        {/* Toast UI Editor를 사용하여 내용 편집 */}
        <Editor
          initialValue={content}
          previewStyle="vertical"
          height="300px"
          initialEditType="markdown"
          useCommandShortcut={true}
          ref={editorRef}
          onChange={() => {
            if (editorRef.current) {
              const instance = editorRef.current.getInstance();
              const markdownContent = instance.getMarkdown();
              setContent(markdownContent);
            }
          }}
        />

        {/* Task 선택 자동완성 */}
        <Autocomplete
          options={taskList}
          getOptionLabel={(option) => option.title}
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
