import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { CollabEase } from '../../components/common/utils/EndpointUtils';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
  Divider,
  Button,
  Dialog,
  TextField,
  Autocomplete
} from '@mui/material';
import CreateBoardDialog from './CreateBoardDialog';

// MUI X DatePicker 관련 imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// =============================
// 타입 정의
// =============================
interface Comment {
  commentId: number;
  commentContent: string;
  commenterUsername: string;   // 백엔드에서 내려주지만, UI에서는 사용하지 않음
  commenterNickname: string;   // <-- 백엔드에서 새로 내려주는 닉네임
  commentCreatedAt: string;
  replies: Comment[];
}

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
}

// =============================
// TASK 수정 컴포넌트
// =============================
interface TaskInfoProps {
  board: BoardData;
  onTaskUpdate?: (updatedTask: Partial<BoardData>) => void;
}

const TaskInfo: React.FC<TaskInfoProps> = ({ board, onTaskUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    taskTitle: board.taskTitle,
    taskDescription: board.taskDescription,
    taskStatus: board.taskStatus,
    dateRange: [
      board.taskStartDate ? new Date(board.taskStartDate) : null,
      board.taskEndDate ? new Date(board.taskEndDate) : null,
    ] as [Date | null, Date | null],
  });

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

  const statusOptions = ['Not Started', 'In Progress', 'Completed'];

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
    <Card
      variant="outlined"
      sx={{ mb: 2, cursor: !isEditing ? 'pointer' : 'default' }}
      // 카드 클릭 시 Edit 모드로 전환
      onClick={() => {
        if (!isEditing) setIsEditing(true);
      }}
    >
      <CardContent>
        {isEditing ? (
          <>
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
                setEditValues({
                  ...editValues,
                  taskDescription: e.target.value,
                })
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
          <>
            <Typography variant="body2">
              <strong>Title:</strong> {board.taskTitle}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {board.taskStatus}
            </Typography>
            <Typography variant="body2">
              <strong>기간:</strong> {board.taskStartDate} ~ {board.taskEndDate}
            </Typography>
            <Typography variant="body2">
              <strong>설명:</strong> {board.taskDescription}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// =============================
// 댓글 컴포넌트
// 한 줄에 [아이디] [댓글] [시간] [X버튼]
// "level=0" 댓글만 클릭 시 대댓글 작성 허용
// "level=1" 대댓글은 회색 배경 + 왼쪽 세로줄(::before)
// =============================
interface CommentItemProps {
  comment: Comment;
  onAddReply: (parentCommentId: number, replyContent: string) => void;
  onDeleteComment: (commentId: number) => void;
  openReplyCommentId: number | null;
  setOpenReplyCommentId: (id: number | null) => void;
  level: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onAddReply,
  onDeleteComment,
  openReplyCommentId,
  setOpenReplyCommentId,
  level,
}) => {
  // 대댓글 작성 텍스트
  const [replyText, setReplyText] = useState('');

  // 현재 댓글이 열려있는지 여부
  const isOpen = openReplyCommentId === comment.commentId;

  // level=0 댓글만 클릭으로 토글
  const handleCommentClick = () => {
    if (level === 0) {
      // 이미 열려있으면 닫고, 아니면 열기
      setOpenReplyCommentId(isOpen ? null : comment.commentId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 댓글 클릭 이벤트와 구분
    onDeleteComment(comment.commentId);
  };

  const handleReplySubmit = () => {
    if (replyText.trim() === '') return;
    onAddReply(comment.commentId, replyText);
    setReplyText('');
    setOpenReplyCommentId(null);
  };

  // 대댓글 스타일(회색 배경 + 왼쪽 세로줄)
  const replyStyle =
    level === 1
      ? {
          position: 'relative',
          backgroundColor: '#f9f9f9',
          mt: 1,
          ml: 2,
          pl: 2,
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
      : { my: 1 };

  return (
    <Box sx={replyStyle}>
      {/* 댓글 한 줄 표시 */}
      <Typography
        variant="body2"
        sx={{ cursor: level === 0 ? 'pointer' : 'default' }}
        onClick={handleCommentClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
          <Box sx={{ width: '15%' }}>
            [{comment.commenterNickname}]
          </Box>
          <Box sx={{ width: '70%' }}>
            {comment.commentContent}
          </Box>
          <Box sx={{ width: '15%', textAlign: 'right' }}>
            {comment.commentCreatedAt}
          </Box>
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
      {/* level=0인 댓글만 대댓글 작성 가능 */}
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

      {/* 대댓글 목록 (대댓글의 대댓글은 허용 X -> replies는 보여주지만 클릭 불가) */}
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
              level={1} // 두 번째 레벨
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

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  onAddReply,
  onDeleteComment,
  openReplyCommentId,
  setOpenReplyCommentId,
}) => (
  <List>
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
);

// =============================
// Board 컴포넌트
// =============================
const Board: React.FC = () => {
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardData | null>(null);
  const [openDialog, setOpenDialog] = useState(false); // 모달 제어용

  // 새 댓글 입력 UI
  const [newCommentActive, setNewCommentActive] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // 대댓글 입력창은 한 번에 하나만 열리도록 관리
  const [openReplyCommentId, setOpenReplyCommentId] = useState<number | null>(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  // 전체 보드 목록 조회
  const fetchBoards = () => {
    axiosInstance
      .get(CollabEase.BOARD.GET_ALL_BOARD)
      .then((response) => {
        const boardData: BoardData[] = response.data;
        setBoards(boardData);
        if (boardData.length > 0) {
          setSelectedBoard(boardData[0]);
        }
      })
      .catch((error) => {
        console.error('Error fetching boards:', error);
      });
  };

  // 게시판 목록에서 게시글 클릭
  const handleBoardClick = (board: BoardData) => {
    setSelectedBoard(board);
    // 새 댓글 입력창 초기화
    setNewCommentActive(false);
    setNewCommentText('');
    // 대댓글 입력창도 닫음
    setOpenReplyCommentId(null);
  };

  // 새 게시글 생성 다이얼로그 열기/닫기
  const handleNewBoardClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 새 게시글 생성 후 목록 갱신
  const handleBoardCreated = () => {
    handleCloseDialog();
    fetchBoards();
  };

  // 최상위 댓글 등록
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

  // 대댓글 등록
  const handleAddReply = (parentCommentId: number, replyContent: string) => {
    if (!selectedBoard) return;

    const requestBody = {
      boardId: selectedBoard.boardId,
      content: replyContent,
      parentCommentId: parentCommentId,
    };

    axiosInstance
      .post(CollabEase.BOARD.CREATE_COMMENT, requestBody)
      .then((response) => {
        const newReply: Comment = response.data;
        // 대댓글 삽입
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

  // 재귀적으로 대댓글 삽입
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

  // 댓글 삭제
// 예: Board.tsx 또는 Comment 처리 로직

const handleDeleteComment = (commentId: number) => {
  if (!selectedBoard) return;

  axiosInstance
    .delete(CollabEase.BOARD.DELETE_COMMENT(commentId.toString()))
    .then(() => {
      // 로컬 상태에서 삭제
      const updatedComments = removeCommentById(selectedBoard.comments, commentId);
      setSelectedBoard({ ...selectedBoard, comments: updatedComments });
    })
    .catch((error) => {
      if (error.response) {
        const status = error.response.status;
        // 백엔드에서 내려주는 데이터가 JSON 형태라면, 보통 { code, message, timestamp } 형태일 것
        const data = error.response.data;

        // 만약 data가 { code, message, timestamp } 형태라면 message를 이렇게 꺼낼 수 있음
        const errorMessage = data.message || '오류가 발생했습니다.';

        if (status === 403) {
          // 권한 오류 (예: "본인이 작성한 댓글만 삭제할 수 있습니다.")
          alert(errorMessage);
        } else {
          // 그 외 에러 상태 처리
          alert(`Error(${status}): ${errorMessage}`);
        }
      } else {
        // 네트워크 에러 등
        console.error('Network or other error:', error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      }
    });
};




  // 재귀적으로 해당 commentId 삭제
  const removeCommentById = (comments: Comment[], targetId: number): Comment[] => {
    return comments
      .filter((c) => c.commentId !== targetId) // 해당 댓글은 제거
      .map((c) => {
        // 자식 대댓글들도 재귀적으로 처리
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: removeCommentById(c.replies, targetId) };
        }
        return c;
      });
  };

  // TASK 수정 완료 후 BoardState 업데이트
  const handleTaskUpdate = (updatedTask: Partial<BoardData>) => {
    if (selectedBoard) {
      const updatedBoard = { ...selectedBoard, ...updatedTask };
      setSelectedBoard(updatedBoard);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        gap: 2,
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      {/* 게시판 목록 (30%) */}
      <Paper
        elevation={1}
        sx={{
          width: '20%',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Typography variant="h6" sx={{ ml: 1 }}>
            게시판 목록
          </Typography>
          <Button variant="contained" onClick={handleNewBoardClick}>
            New
          </Button>
        </Box>
        <List>
          {boards.map((board) => (
            <ListItemButton
              key={`${board.boardId}-${board.taskId}`}
              selected={
                selectedBoard?.boardId === board.boardId &&
                selectedBoard?.taskId === board.taskId
              }
              onClick={() => handleBoardClick(board)}
            >
              <ListItemText
                primary={board.boardTitle}
                secondary={`작성자: ${board.nickname} | 조회수: ${board.boardViewCount}`}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
  
      {/* 상세 및 댓글 영역 (70%) */}
      <Box sx={{ width: '55%', height: '100%', overflowY: 'auto' }}>
        {selectedBoard ? (
          <Paper elevation={3} sx={{ p: 2, height: '100%', boxSizing: 'border-box' }}>
            <Typography variant="h5" gutterBottom>
              {selectedBoard.boardTitle}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {selectedBoard.boardContent}
            </Typography>
            <Divider sx={{ my: 2 }} />
  
            {/* TASK 수정 컴포넌트 */}
            <TaskInfo board={selectedBoard} onTaskUpdate={handleTaskUpdate} />
   
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
  
            {/* 최상위 댓글 입력창 */}
            {!newCommentActive ? (
              <Box
                onClick={() => setNewCommentActive(true)}
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
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
          </Paper>
        ) : (
          <Typography variant="h6">게시글을 선택해주세요</Typography>
        )}
      </Box>
  
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <CreateBoardDialog onClose={handleCloseDialog} onBoardCreated={handleBoardCreated} />
      </Dialog>
    </Box>
  );
};

export default Board;
