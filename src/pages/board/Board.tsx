import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { CollabEase } from '../../components/common/utils/EndpointUtils';

// MUI 관련 import
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  Divider,
  Button,
  Dialog,
  TextField,
  Autocomplete,
  Pagination,
  Link,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItem,
  ListItemText,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Viewer } from '@toast-ui/react-editor';
import CreateBoardDialog from './CreateBoardDialog';

// =======================================
// (1) 타입 정의
// =======================================

// 파일 정보
interface FileData {
  fileName: string;
  fileUrl: string;
}

// 댓글 정보
interface Comment {
  commentId: number;
  commentContent: string;
  commenterUsername: string;
  commenterNickname: string;
  commentCreatedAt: string;
  replies: Comment[];
}

// 게시글(Board) + Task 정보 (원본에 따라 필드 추가/삭제 가능)
interface BoardData {
  taskId: number;
  taskTitle: string;
  taskDescription: string;
  taskStartDate: string;
  taskEndDate: string;
  taskStatus: string;
  taskCreatedAt: string;
  taskUpdatedAt: string;

  boardId: number;
  boardTitle: string;
  boardContent: string;
  boardViewCount: number;
  boardCreatedAt: string;
  boardUpdatedAt: string;
  comments: Comment[];
  username: string;
  nickname: string;
  files?: FileData[];
}

// 페이지 응답 구조 (Spring Data `Page<T>`)
interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // 현재 페이지 (0-based)
  // 그 외 필요한 필드들
}

// =======================================
// (2) TaskInfoProps + TaskInfo 컴포넌트
// =======================================

interface TaskInfoProps {
  board: BoardData;
  onTaskUpdate?: (updatedTask: Partial<BoardData>) => void;
}

/**
 * TaskInfo
 * - Task(업무) 관련 필드(제목/설명/기간/상태)를 보여주고,
 *   "수정 모드"로 전환하면 수정 가능하게 만든 예시입니다.
 */
const TaskInfo: React.FC<TaskInfoProps> = ({ board, onTaskUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  // 수정 모드에서 쓸 임시 값
  const [editValues, setEditValues] = useState({
    taskTitle: board.taskTitle,
    taskDescription: board.taskDescription,
    taskStatus: board.taskStatus,
    dateRange: [
      board.taskStartDate ? new Date(board.taskStartDate) : null,
      board.taskEndDate ? new Date(board.taskEndDate) : null,
    ] as [Date | null, Date | null],
  });

  // board가 바뀔 때마다 editValues 초기화
  useEffect(() => {
    setEditValues({
      taskTitle: board.taskTitle,
      taskDescription: board.taskDescription,
      taskStatus: board.taskStatus,
      dateRange: [
        board.taskStartDate ? new Date(board.taskStartDate) : null,
        board.taskEndDate ? new Date(board.taskEndDate) : null,
      ],
    });
  }, [board]);

  // 상태 옵션
  const statusOptions = ['Not Started', 'In Progress', 'Completed'];

  // "저장" 버튼 클릭 시
  const handleSave = () => {
    if (onTaskUpdate) {
      onTaskUpdate({
        taskTitle: editValues.taskTitle,
        taskDescription: editValues.taskDescription,
        taskStatus: editValues.taskStatus,
        taskStartDate: editValues.dateRange[0]
          ? editValues.dateRange[0].toISOString()
          : '',
        taskEndDate: editValues.dateRange[1]
          ? editValues.dateRange[1].toISOString()
          : '',
      });
    }
    setIsEditing(false);
  };

  // "취소" 버튼 클릭 시
  const handleCancel = () => {
    setEditValues({
      taskTitle: board.taskTitle,
      taskDescription: board.taskDescription,
      taskStatus: board.taskStatus,
      dateRange: [
        board.taskStartDate ? new Date(board.taskStartDate) : null,
        board.taskEndDate ? new Date(board.taskEndDate) : null,
      ],
    });
    setIsEditing(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {isEditing ? (
        <>
          {/* 수정 모드 */}
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={editValues.taskTitle}
            onChange={(e) =>
              setEditValues({ ...editValues, taskTitle: e.target.value })
            }
          />
          <Autocomplete
            options={statusOptions}
            value={editValues.taskStatus}
            onChange={(event: React.SyntheticEvent, newValue: string | null) => {
              setEditValues({ ...editValues, taskStatus: newValue || '' });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Status" variant="outlined" sx={{ mb: 2 }} />
            )}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="Start Date"
                value={editValues.dateRange[0]}
                onChange={(newValue) => {
                  setEditValues({
                    ...editValues,
                    dateRange: [newValue, editValues.dateRange[1]],
                  });
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="End Date"
                value={editValues.dateRange[1]}
                onChange={(newValue) => {
                  setEditValues({
                    ...editValues,
                    dateRange: [editValues.dateRange[0], newValue],
                  });
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>

          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            minRows={3}
            sx={{ mb: 2 }}
            value={editValues.taskDescription}
            onChange={(e) =>
              setEditValues({ ...editValues, taskDescription: e.target.value })
            }
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </>
      ) : (
        // 조회 모드
        <Box sx={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Title:</strong> {board.taskTitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Status:</strong> {board.taskStatus}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>기간:</strong> {board.taskStartDate} ~ {board.taskEndDate}
          </Typography>
          <Typography variant="body1">
            <strong>설명:</strong> {board.taskDescription}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// =======================================
// (3) 댓글(Comment) 컴포넌트
// =======================================

interface CommentItemProps {
  comment: Comment;
  onAddReply: (parentCommentId: number, replyContent: string) => void;
  onDeleteComment: (commentId: number) => void;
  openReplyCommentId: number | null;
  setOpenReplyCommentId: (id: number | null) => void;
  level: number; // 대댓글 구분용 레벨
}

/**
 * 1개의 댓글(또는 대댓글)을 렌더링하는 컴포넌트
 */
const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onAddReply,
  onDeleteComment,
  openReplyCommentId,
  setOpenReplyCommentId,
  level,
}) => {
  const [replyText, setReplyText] = useState('');
  const isOpen = openReplyCommentId === comment.commentId;

  // 최상위 댓글(레벨=0)을 클릭하면 대댓글 입력창 열기/닫기
  const handleCommentClick = () => {
    if (level === 0) {
      setOpenReplyCommentId(isOpen ? null : comment.commentId);
    }
  };

  // 댓글 삭제 버튼
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteComment(comment.commentId);
  };

  // 대댓글 작성
  const handleReplySubmit = () => {
    if (replyText.trim() === '') return;
    onAddReply(comment.commentId, replyText);
    setReplyText('');
    setOpenReplyCommentId(null);
  };

  // 스타일: 레벨=1이면 좌측에 여백&라인 추가
  const replyStyle =
    level === 1
      ? {
          position: 'relative',
          backgroundColor: '#f9f9f9',
          mt: 1,
          ml: 2,
          pl: 2,
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: '#999',
          },
        }
      : { my: 1, wordWrap: 'break-word', whiteSpace: 'pre-wrap' };

  return (
    <Box sx={replyStyle}>
      {/* 댓글 내용 */}
      <Typography
        variant="body2"
        sx={{ cursor: level === 0 ? 'pointer' : 'default' }}
        onClick={handleCommentClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
          <Box sx={{ width: '15%' }}>[{comment.commenterNickname}]</Box>
          <Box sx={{ width: '70%' }}>{comment.commentContent}</Box>
          <Box sx={{ width: '15%', textAlign: 'right' }}>{comment.commentCreatedAt}</Box>
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={handleDelete}
            sx={{ minWidth: 'auto', p: 0 }}
          >
            X
          </Button>
        </Box>
      </Typography>

      {/* 대댓글 입력창 */}
      {level === 0 && isOpen && (
        <Box sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            multiline
            minRows={2}
            placeholder="대댓글을 입력하세요..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Button variant="contained" size="small" onClick={handleReplySubmit}>
              등록
            </Button>
          </Box>
        </Box>
      )}

      {/* 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <Box>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.commentId}
              comment={reply}
              onAddReply={onAddReply}
              onDeleteComment={onDeleteComment}
              openReplyCommentId={openReplyCommentId}
              setOpenReplyCommentId={setOpenReplyCommentId}
              level={1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

interface CommentListProps {
  comments?: Comment[];
  onAddReply: (parentCommentId: number, replyContent: string) => void;
  onDeleteComment: (commentId: number) => void;
  openReplyCommentId: number | null;
  setOpenReplyCommentId: (id: number | null) => void;
}

/**
 * 댓글 전체 목록을 감싸는 컴포넌트
 */
const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  onAddReply,
  onDeleteComment,
  openReplyCommentId,
  setOpenReplyCommentId,
}) => (
  <Box>
    <List sx={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          onAddReply={onAddReply}
          onDeleteComment={onDeleteComment}
          openReplyCommentId={openReplyCommentId}
          setOpenReplyCommentId={setOpenReplyCommentId}
          level={0}
        />
      ))}
    </List>
  </Box>
);

// =======================================
// (4) Board.tsx 메인 컴포넌트
// =======================================
const Board: React.FC = () => {
  // 게시글 목록(현재 페이지에 해당), 선택된 게시글, 기타 상태
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardData | null>(null);

  // 새 게시글 생성 다이얼로그 열림 여부
  const [openDialog, setOpenDialog] = useState(false);

  // 댓글 작성 입력창 열림 여부
  const [newCommentActive, setNewCommentActive] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [openReplyCommentId, setOpenReplyCommentId] = useState<number | null>(null);

  // 수정 모달 다이얼로그
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // ===========================
  // (A) 페이지네이션 관련 상태
  // ===========================
  const [totalPages, setTotalPages] = useState<number>(1);   // 전체 페이지 수
  const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지(1-based)

  // ===========================
  // (B) useEffect: 페이지 변경 시마다 목록 재조회
  // ===========================
  useEffect(() => {
    fetchBoards(currentPage);
  }, [currentPage]);

  // ===========================
  // (C) 목록 조회 (서버 페이지네이션)
  // ===========================
  const fetchBoards = (page: number) => {
    // 백엔드 스프링은 0-based. 따라서 pageParam = (page-1)
    const pageParam = page - 1;

    axiosInstance
      .get<PageResponse<BoardData>>(CollabEase.BOARD.GET_ALL_BOARD, {
        params: {
          page: pageParam,
          size: 20, // 한 페이지 크기
        },
      })
      .then((response) => {
        const data = response.data;
        // data.content: 현재 페이지의 게시글 목록
        // data.totalPages: 전체 페이지 개수
        setBoards(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        console.error('Error fetching boards:', error);
      });
  };

  // ===========================
  // (D) 페이지 변경 핸들러
  // ===========================
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value); // useEffect가 감지하여 fetchBoards(value) 호출
  };

  // ===========================
  // 게시글 클릭 시 상세 보기
  // ===========================
  const handleBoardClick = (board: BoardData) => {
    setSelectedBoard(board);
    setNewCommentActive(false);
    setNewCommentText('');
    setOpenReplyCommentId(null);
    // 스크롤 최상단 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ===========================
  // 새 게시글 생성 다이얼로그
  // ===========================
  const handleNewBoardClick = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleBoardCreated = () => {
    // 새 글 생성 후 첫 페이지로 돌아가 목록 갱신
    setOpenDialog(false);
    setCurrentPage(1);
  };

  // ===========================
  // 수정 모달 열기
  // ===========================
  const handleEditClick = () => {
    if (!selectedBoard) return;
    setEditTitle(selectedBoard.boardTitle);
    setEditContent(selectedBoard.boardContent);
    setOpenEditDialog(true);
  };
  const handleEditCancel = () => {
    setOpenEditDialog(false);
  };

  // ===========================
  // (E) 게시글 수정 처리
  // ===========================
  const handleEditSave = async () => {
    if (!selectedBoard) return;
    try {
      // 요청 바디
      const updateData = {
        boardId: selectedBoard.boardId,
        title: editTitle,
        content: editContent,
      };

      // POST /api/board/update  (JSON 전송)
      const response = await axiosInstance.post(
        CollabEase.BOARD.UPDATE_BOARD,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const updatedBoard: BoardData = response.data;
      setSelectedBoard(updatedBoard);
      alert('수정 완료!');
    } catch (error) {
      console.error(error);
      alert('게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setOpenEditDialog(false);
    }
  };

  // ===========================
  // (F) 게시글 삭제 처리
  // ===========================
  const handleDeleteClick = async () => {
    if (!selectedBoard) return;
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axiosInstance.post(CollabEase.BOARD.DELETE_BOARD, null, {
        params: { boardId: selectedBoard.boardId },
      });
      alert('삭제 완료!');
      // 목록 다시 로드 (현재 페이지 그대로)
      fetchBoards(currentPage);
      // 상세보기 해제
      setSelectedBoard(null);
    } catch (error) {
      console.error(error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  // ===========================
  // (G) 댓글 생성
  // ===========================
  const handleAddComment = () => {
    if (!selectedBoard || newCommentText.trim() === '') return;

    const requestBody = {
      boardId: selectedBoard.boardId,
      content: newCommentText,
      parentCommentId: null,
    };

    axiosInstance
      .post(CollabEase.BOARD.CREATE_COMMENT, requestBody)
      .then((response) => {
        const newComment: Comment = response.data;
        const updatedComments = [...(selectedBoard.comments || []), newComment];
        setSelectedBoard({ ...selectedBoard, comments: updatedComments });
        setNewCommentText('');
        setNewCommentActive(false);
      })
      .catch((error) => {
        console.error('Error adding comment:', error);
      });
  };

  // 대댓글 생성
  const handleAddReply = (parentCommentId: number, replyContent: string) => {
    if (!selectedBoard) return;

    const requestBody = {
      boardId: selectedBoard.boardId,
      content: replyContent,
      parentCommentId,
    };

    axiosInstance
      .post(CollabEase.BOARD.CREATE_COMMENT, requestBody)
      .then((response) => {
        const newReply: Comment = response.data;
        const updatedComments = addReplyToComments(
          selectedBoard.comments,
          parentCommentId,
          newReply
        );
        setSelectedBoard({ ...selectedBoard, comments: updatedComments });
      })
      .catch((error) => {
        console.error('Error adding reply:', error);
      });
  };

  // 대댓글 추가 로직
  const addReplyToComments = (
    comments: Comment[],
    parentId: number,
    newReply: Comment
  ): Comment[] => {
    return comments.map((c) => {
      if (c.commentId === parentId) {
        return { ...c, replies: [...(c.replies || []), newReply] };
      } else if (c.replies && c.replies.length > 0) {
        return { ...c, replies: addReplyToComments(c.replies, parentId, newReply) };
      }
      return c;
    });
  };

  // ===========================
  // (H) 댓글 삭제
  // ===========================
  const handleDeleteComment = (commentId: number) => {
    if (!selectedBoard) return;

    axiosInstance
      .delete(CollabEase.BOARD.DELETE_COMMENT(commentId.toString()))
      .then(() => {
        const updatedComments = removeCommentById(selectedBoard.comments, commentId);
        setSelectedBoard({ ...selectedBoard, comments: updatedComments });
      })
      .catch((error) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          const errorMessage = data.message || '오류가 발생했습니다.';
          if (status === 403) {
            alert(errorMessage);
          } else {
            alert(`Error(${status}): ${errorMessage}`);
          }
        } else {
          console.error('Network or other error:', error);
          alert('댓글 삭제 중 오류가 발생했습니다.');
        }
      });
  };

  // 댓글 삭제 재귀 함수
  const removeCommentById = (comments: Comment[], targetId: number): Comment[] => {
    return comments
      .filter((c) => c.commentId !== targetId)
      .map((c) => {
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: removeCommentById(c.replies, targetId) };
        }
        return c;
      });
  };

  // ===========================
  // (I) TaskInfo에서 Task 수정 시
  // ===========================
  const handleTaskUpdate = (updatedTask: Partial<BoardData>) => {
    if (selectedBoard) {
      const updatedBoard = { ...selectedBoard, ...updatedTask };
      setSelectedBoard(updatedBoard);
    }
  };

  // ===========================
  // (J) 파일 다운로드
  // ===========================
  const handleFileDownload = async (file: FileData) => {
    try {
      const downloadUrl = `${CollabEase.BOARD.DOWNLOAD_BOARD_FILE}?fileUrl=${encodeURIComponent(
        file.fileUrl
      )}`;
      const response = await axiosInstance.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const tempUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = tempUrl;
      link.download = file.fileName;
      link.click();
      link.remove();
      URL.revokeObjectURL(tempUrl);
    } catch (error) {
      console.error(error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  // ===========================
  // (K) 렌더링
  // ===========================
  return (
    <Box sx={{ p: 2 }}>
      {/* (1) 선택한 게시글 상세 표시 */}
      {selectedBoard && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 4,
            position: 'relative',
          }}
        >
          {/* 우측 상단에 파일 목록 */}
          <Box sx={{ position: 'absolute', top: 8, right: 16, textAlign: 'right' }}>
            {selectedBoard.files?.map((file, idx) => (
              <Link
                key={idx}
                variant="caption"
                underline="hover"
                sx={{ display: 'block', cursor: 'pointer', color: 'blue' }}
                onClick={() => handleFileDownload(file)}
              >
                {file.fileName}
              </Link>
            ))}
          </Box>

          {/* 제목, 작성자, 작성일 */}
          <Typography variant="h5" gutterBottom>
            {selectedBoard.boardTitle}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
            {selectedBoard.nickname} | {selectedBoard.boardCreatedAt}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* 본문 (Toast UI Viewer) */}
          <Box sx={{ px: 1, py: 1 }}>
            <Viewer key={selectedBoard.boardId} initialValue={selectedBoard.boardContent} />
          </Box>
          <Divider sx={{ my: 2 }} />

          {/* TaskInfo (업무 정보 수정) */}
          <TaskInfo board={selectedBoard} onTaskUpdate={handleTaskUpdate} />
          <Divider sx={{ my: 2 }} />

          {/* 댓글 */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            댓글
          </Typography>
          <CommentList
            comments={selectedBoard.comments}
            onAddReply={handleAddReply}
            onDeleteComment={handleDeleteComment}
            openReplyCommentId={openReplyCommentId}
            setOpenReplyCommentId={setOpenReplyCommentId}
          />

          {/* 최상위 댓글 입력 */}
          {!newCommentActive ? (
            <Box
              onClick={() => setNewCommentActive(true)}
              sx={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                p: 2,
                cursor: 'text',
                color: '#aaa',
                mt: 2,
              }}
            >
              댓글 입력하기...
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                placeholder="댓글을 입력하세요..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleAddComment}>
                  등록
                </Button>
              </Box>
            </Box>
          )}

          {/* 수정 / 삭제 버튼 */}
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button variant="outlined" sx={{ mr: 2 }} onClick={handleEditClick}>
              수정
            </Button>
            <Button variant="outlined" color="error" onClick={handleDeleteClick}>
              삭제
            </Button>
          </Box>
        </Paper>
      )}

      {/* (2) 게시판 목록 */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">게시판 목록</Typography>
          <Button variant="contained" onClick={handleNewBoardClick}>
            New
          </Button>
        </Box>

        {/* 목록 헤더 */}
        <Box
          sx={{
            display: 'flex',
            px: 2,
            py: 1,
            borderBottom: '1px solid #ccc',
            fontWeight: 'bold',
          }}
        >
          <Typography sx={{ width: '10%' }}>번호</Typography>
          <Typography sx={{ width: '50%' }}>제목</Typography>
          <Typography sx={{ width: '20%' }}>글쓴이</Typography>
          <Typography sx={{ width: '20%' }}>작성일</Typography>
        </Box>

        {/* 실제 목록 데이터 (boards 상태) */}
        <List>
          {boards.map((board, index) => (
            <ListItemButton
              key={`${board.boardId}`}
              selected={selectedBoard?.boardId === board.boardId}
              onClick={() => handleBoardClick(board)}
            >
              <Box sx={{ display: 'flex', width: '100%' }}>
                {/* 번호: (currentPage-1)*20 + (index+1) */}
                <Typography sx={{ width: '10%' }}>
                  {(currentPage - 1) * 20 + (index + 1)}
                </Typography>
                <Typography sx={{ width: '50%' }}>{board.boardTitle}</Typography>
                <Typography sx={{ width: '20%' }}>{board.nickname}</Typography>
                <Typography sx={{ width: '20%' }}>{board.boardCreatedAt}</Typography>
              </Box>
            </ListItemButton>
          ))}
        </List>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}       // 전체 페이지 수
              page={currentPage}       // 현재 페이지 (1-based)
              onChange={handlePageChange}
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* (3) 새 게시글 생성 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <CreateBoardDialog
          onClose={handleCloseDialog}
          onBoardCreated={handleBoardCreated}
        />
      </Dialog>

      {/* (4) 수정 모달 다이얼로그 */}
      <Dialog open={openEditDialog} onClose={handleEditCancel} maxWidth="md" fullWidth>
        <DialogTitle>게시글 수정</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="제목"
            fullWidth
            margin="normal"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextField
            label="본문"
            fullWidth
            multiline
            minRows={5}
            margin="normal"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          {/* 필요하다면 파일 첨부 <input type="file" multiple ...> etc. */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>취소</Button>
          <Button variant="contained" onClick={handleEditSave}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Board;
