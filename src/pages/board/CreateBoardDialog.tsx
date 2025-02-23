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
import { createTheme } from '@mui/material/styles';
import { CollabEase } from '../../components/common/utils/EndpointUtils';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

interface TaskItem {
  taskId: string;
  title: string;
}

interface PendingUpload {
  id: string;
  file: File;
  type: 'image' | 'file';
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

  // 업로드 전까지 보관할 파일 정보(첨부파일, 이미지 공통)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [uploading, setUploading] = useState(false);

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

  /** 파일(이미지/첨부파일)을 업로드 대기열에 추가 */
  const queueUpload = (file: File, type: 'image' | 'file'): string => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setPendingUploads((prev) => [...prev, { id, file, type }]);
    return id;
  };

  /** [파일] 업로드 버튼 클릭 -> 파일 선택 */
  const handleCustomFileUploadClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e: any) => {
      const file: File = e.target.files?.[0];
      if (!file) return;

      // 용량 체크
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 5) {
        alert('파일 용량은 최대 5MB까지 허용됩니다.');
        return;
      }

      // 에디터 내에 플레이스 홀더 삽입
      const id = queueUpload(file, 'file');
      const editorInstance = editorRef.current?.getInstance();
      if (editorInstance) {
        editorInstance.insertText(`{{upload:${id}}}`);
      }
    };
    fileInput.click();
  };

  /** [이미지] 에디터 내 이미지 업로드 훅 -> 즉시 업로드 대신 대기열로 */
  const handleImageBlobHook = async (
    blob: Blob,
    callback: (url: string, altText?: string) => void
  ) => {
    const fileSizeMB = blob.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      alert('이미지 용량은 최대 5MB까지 허용됩니다.');
      return false;
    }
    // Blob -> File
    const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
    const id = queueUpload(file, 'image');

    // 에디터에 플레이스홀더 삽입
    callback(`{{upload:${id}}}`, 'image');
    return false;
  };

  /** 생성 버튼 클릭 -> 대기열 파일 업로드 -> 플레이스홀더 치환 -> 최종 전송 */
  const handleCreate = async () => {
    setUploading(true);
    try {
      // 1) 에디터 본문 가져오기
      let finalContent = editorRef.current?.getInstance().getMarkdown() || content;

      // 2) 대기열 파일 전부 업로드
      const uploadResults = await Promise.all(
        pendingUploads.map(async (item) => {
          const formData = new FormData();
          formData.append('file', item.file);
          const response = await axiosInstance.post('/api/board/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return { id: item.id, url: response.data };
        })
      );

      // 3) 플레이스홀더 -> 실제 URL 치환
      uploadResults.forEach(({ id, url }) => {
        const placeholder = `{{upload:${id}}}`;
        finalContent = finalContent.split(placeholder).join(url);
      });

      // 4) 최종 데이터 전송
      const boardData = {
        title,
        content: finalContent,
        taskId: selectedTask?.taskId
      };
      await axiosInstance.post(CollabEase.BOARD.CREATE_BOARD, boardData);

      // 완료 후 초기화
      setPendingUploads([]);
      onBoardCreated();
    } catch (err: unknown) {
      let errorMessage = '게시글 생성 중 에러가 발생했습니다.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(errorMessage);
      console.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  /** TUI Editor의 툴바에 넣을 파일 업로드 버튼(DOM 요소) 생성 */
  const createCustomFileUploadButton = () => {
    // 순수 DOM으로 버튼 생성
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = '📎';
    button.title = '파일 업로드';

    // 예시: MUI 스타일을 흉내내기 위한 간단한 인라인 스타일
    button.style.background = 'none';
    button.style.border = '1px solid rgba(25, 118, 210, 0.5)';
    button.style.borderRadius = '4px';
    button.style.padding = '3px 8px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.marginLeft = '4px';

    // 클릭 이벤트 리스너
    button.addEventListener('click', handleCustomFileUploadClick);

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
            addImageBlobHook: handleImageBlobHook
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
                el: createCustomFileUploadButton() // 여기서 즉시 DOM 요소를 생성하여 반환
              }
            ]
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
        <Button onClick={onClose} disabled={uploading}>
          취소
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={uploading}>
          생성
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateBoardDialog;
