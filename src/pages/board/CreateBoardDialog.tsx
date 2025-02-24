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

  // 여러 파일을 받을 수 있도록 FileList를 관리
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const editorRef = useRef<Editor>(null);

  // Task 목록 불러오기
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

  /**
   * 여러 파일 선택(추가) 시 상태에 저장
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    // 새롭게 선택한 파일들을 배열로 변환
    const filesArray = Array.from(event.target.files);
    // 기존 state에 누적(중복되지 않게 관리하려면 필터나 별도 로직 추가)
    setSelectedFiles((prev) => [...prev, ...filesArray]);
  };

  /**
   * TUI Editor에서 이미지를 삽입할 때 호출되는 훅
   * 이 예시에서는 즉시 업로드 대신, 단순 경고 후 삽입 취소하거나
   * 필요 시 별도 업로드 로직 작성 가능
   */
  const handleImageBlobHook = async (
    blob: Blob,
    callback: (url: string, altText?: string) => void
  ) => {
    const fileSizeMB = blob.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      alert('이미지 용량은 최대 5MB까지 허용됩니다.');
      return false;
    }
    // 여기서는 실제 업로드 없이, 에디터에 임시 텍스트만 삽입
    // 실제로 업로드하려면 FormData를 통해 즉시 서버에 업로드하고
    // 응답으로 받은 이미지 URL을 callback에 넣어주면 됩니다.
    const tempUrl = URL.createObjectURL(blob);
    callback(tempUrl, 'image-from-tui');

    return false; // TUI Editor가 내부적으로 처리하지 않도록
  };
  const handleCreate = async () => {
    try {
      // 에디터에서 최종 본문 내용 가져오기
      const finalContent = editorRef.current?.getInstance().getMarkdown() || content;
  
      // 게시글 데이터 객체 생성
      const boardDataObj = {
        title,
        content: finalContent,
        taskId: selectedTask?.taskId,
      };
  
      // FormData 구성: boardData는 JSON 문자열로 추가
      const formData = new FormData();
      formData.append('boardData', JSON.stringify(boardDataObj));
  
      // 선택된 파일들 추가
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
  
      // axios가 FormData 전송 시 Content-Type을 자동 설정합니다.
      await axiosInstance.post('/api/board', formData);
  
      // 성공 후 상태 정리
      setSelectedFiles([]);
      onBoardCreated();
    } catch (err) {
      console.error(err);
      alert('게시글 생성 중 에러가 발생했습니다.');
    }
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
            ['code', 'codeblock']
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

        {/* 다중 파일 업로드 영역 */}
        <div style={{ marginTop: '1rem' }}>
          <Button variant="outlined" component="label">
            파일 선택
            <input
              hidden
              multiple
              type="file"
              onChange={handleFileChange}
            />
          </Button>

          {/* 선택된 파일 목록 표시(옵션) */}
          <div style={{ marginTop: '0.5rem' }}>
            {selectedFiles.map((file, index) => (
              <div key={index}>{file.name}</div>
            ))}
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          취소
        </Button>
        <Button variant="contained" onClick={handleCreate}>
          생성
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateBoardDialog;
