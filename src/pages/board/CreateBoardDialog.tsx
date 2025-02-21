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

interface TaskItem {
  taskId: string;
  title: string;
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
  // 선택한 파일들을 관리 (여러 파일 업로드 가능)
  const [selectedFiles, setselectedFiles] = useState<File[]>([]);

  const editorRef = useRef<Editor>(null);

  useEffect(() => {
    axiosInstance
      .get<TaskItem[]>(CollabEase.BOARD.GET_TASK_DATA)
      .then((response) => {
        setTaskList(response.data);
      })
      .catch((error) => {
        console.error('Error fetching task list:', error);
      });
  }, []);

  const handleCreate = async () => {
    // 에디터의 최신 내용을 가져옵니다.
    const markdownContent = editorRef.current?.getInstance().getMarkdown() || content;

    const boardData = {
      title,
      content: markdownContent,
      taskId: selectedTask?.taskId,
    };

    const formData = new FormData();
    formData.append("boardData", JSON.stringify(boardData));

    // 선택한 모든 파일들을 FormData에 추가합니다.
    selectedFiles.forEach((file: File) => {
      formData.append("files", file);
    });

    try {
      const response = await axiosInstance.post(
        CollabEase.BOARD.CREATE_BOARD,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onBoardCreated();
    } catch (error: unknown) {
      let errorMessage = '게시글 생성 중 에러가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error creating board:', errorMessage);
      alert(errorMessage);
    }
  };

  const createCustomFileUploadButton = () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.padding = '0 8px';
    button.title = '파일 업로드';
    button.innerText = '📎';

    button.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.onchange = (e: any) => {
        const file: File = e.target.files?.[0];
        if (!file) return;

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 5) {
          alert('파일 용량은 최대 5MB까지 허용됩니다.');
          return;
        }

        // 선택한 파일을 state에 추가합니다.
        setselectedFiles((prevFiles) => [...prevFiles, file]);

        // 에디터에 파일명(또는 간단한 마크다운)을 삽입합니다.
        const editorInstance = editorRef.current?.getInstance();
        if (editorInstance) {
          // 실제 파일 URL은 등록 시 처리되므로, 임시 링크로 파일명을 표시합니다.
          editorInstance.insertText(`[${file.name}]`);
        }
      };
      fileInput.click();
    });

    return button;
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

        <Editor
          initialValue={content}
          previewStyle="vertical"
          height="300px"
          initialEditType="markdown"
          useCommandShortcut
          ref={editorRef}
          hooks={{
            addImageBlobHook: async (blob, callback) => {
              const fileSizeMB = blob.size / (1024 * 1024);
              if (fileSizeMB > 5) {
                alert('이미지 용량은 최대 5MB까지 허용됩니다.');
                return false;
              }
              // 이미지 파일은 바로 업로드할 수도 있지만,
              // 만약 이미지도 나중에 함께 전송하려면 이 부분도 수정해야 합니다.
              // 현재 예시에서는 기존 로직을 그대로 유지합니다.
              try {
                const formData = new FormData();
                formData.append('file', blob);

                const response = await axiosInstance.post(
                  CollabEase.BOARD.UPLOAD_BOARD_FILE,
                  formData,
                  { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                const fileUrl = response.data.fileUrl;
                callback(fileUrl, '이미지');
              } catch (error: unknown) {
                let errorMessage = '이미지 업로드 중 오류가 발생했습니다.';
                if (error instanceof Error) {
                  errorMessage = error.message;
                }
                console.error('File upload error:', errorMessage);
                alert(errorMessage);
              }
              return false;
            },
          }}
          toolbarItems={[
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task', 'indent', 'outdent'],
            ['table', 'image', 'link'],
            ['code', 'codeblock'],
            [
              {
                name: 'fileUpload',
                tooltip: '파일 업로드',
                el: createCustomFileUploadButton(),
              },
            ],
          ]}
          onChange={() => {
            if (editorRef.current) {
              const instance = editorRef.current.getInstance();
              const markdownContent = instance.getMarkdown();
              setContent(markdownContent);
            }
          }}
        />

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
