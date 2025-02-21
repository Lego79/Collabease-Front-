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
  Autocomplete,
  Pagination
} from '@mui/material';
import CreateBoardDialog from './CreateBoardDialog';

// MUI X DatePicker 관련 imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// toast UI Editor Viewer import
import { Viewer } from '@toast-ui/react-editor';

// =============================
// 타입 정의
// =============================
interface Comment {
  commentId: number;
  commentContent: string;
  commenterUsername: string;
  commenterNickname: string;
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
  const [replyText, setReplyText] = useState('');
  const isOpen = openReplyCommentId === comment.commentId;

  const handleCommentClick = () => {
    if (level === 0) {
      setOpenReplyCommentId(isOpen ? null : comment.commentId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteComment(comment.commentId);
  };

  const handleReplySubmit = () => {
    if (replyText.trim() === '') return;
    onAddReply(comment.commentId, replyText);
    setReplyText('');
    setOpenReplyCommentId(null);
  };

  // 긴 댓글 내용도 깨지지 않도록 wordWrap 적용
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
      <Typography
        variant="body2"
        sx={{ cursor: level === 0 ? 'pointer' : 'default' }}
        onClick={handleCommentClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
          <Box sx={{ width: '15%' }}>[{comment.commenterNickname}]</Box>
          <Box sx={{ width: '70%' }}>{comment.commentContent}</Box>
          <Box sx={{ width: '15%', textAlign: 'right' }}>{comment.commentCreatedAt}</Box>
          <Button variant="text" color="error" size="small" onClick={handleDelete} sx={{ minWidth: 'auto', p: 0 }}>
            X
          </Button>
        </Box>
      </Typography>
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

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  onAddReply,
  onDeleteComment,
  openReplyCommentId,
  setOpenReplyCommentId,
}) => (
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
);

// =============================
// Board 컴포넌트
// =============================
const Board: React.FC = () => {
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardData | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCommentActive, setNewCommentActive] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [openReplyCommentId, setOpenReplyCommentId] = useState<number | null>(null);

  // 페이징 관련 상태 (한 페이지에 12개씩)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(boards.length / itemsPerPage);

  // 페이지에 따라 보여줄 데이터만 slice
  const displayedBoards = boards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetchBoards();
  }, []);

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

  const handleBoardClick = (board: BoardData) => {
    setSelectedBoard(board);
    setNewCommentActive(false);
    setNewCommentText('');
    setOpenReplyCommentId(null);
  };

  const handleNewBoardClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleBoardCreated = () => {
    handleCloseDialog();
    fetchBoards();
  };

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
        width: '100%',
        height: '100vh',
        gap: 2,
        p: 2,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* 게시판 목록 (왼쪽 패널) */}
      <Paper
        elevation={1}
        sx={{
          width: '20%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
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
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <List>
            {displayedBoards.map((board) => (
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
        </Box>
        {/* Pagination: 12개씩 보여주고 나머지는 페이징 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* 상세 및 댓글 영역 (오른쪽 패널) */}
      <Box sx={{ width: '80%', height: '100%', overflowY: 'auto' }}>
        {selectedBoard ? (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              height: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              {selectedBoard.boardTitle}
            </Typography>
            {/* toast UI Editor Viewer로 게시글 내용 렌더링 */}
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2,
                backgroundColor: '#fafafa',
                // 긴 텍스트/코드에 대비
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
              }}
            >
              <Viewer key={selectedBoard.boardId} initialValue={selectedBoard.boardContent} />
            </Box>

            <Divider />

            {/* TASK 수정 컴포넌트 */}
            <TaskInfo board={selectedBoard} onTaskUpdate={handleTaskUpdate} />

            <Typography variant="h6">댓글</Typography>
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
                }}
              >
                댓글 입력하기...
              </Box>
            ) : (
              <Box>
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="댓글을 입력하세요..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  sx={{ mt: 1 }}
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
