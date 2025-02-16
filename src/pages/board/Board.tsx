import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { CollabEase } from '../../components/common/utils/EndpointUtils';
import {
  Container,
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
  TextField
} from '@mui/material';
import CreateBoardDialog from './CreateBoardDialog';

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'


interface Comment {
  commentId: number;
  commentContent: string;
  commenterUsername: string;
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

const TaskInfo: React.FC<{ board: BoardData }> = ({ board }) => (
  <Card variant="outlined" sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Task 정보
      </Typography>
      <Typography variant="body2">
        <strong>Task Title:</strong> {board.taskTitle}
      </Typography>
      <Typography variant="body2">
        <strong>Task Status:</strong> {board.taskStatus}
      </Typography>
      <Typography variant="body2">
        <strong>기간:</strong> {board.taskStartDate} ~ {board.taskEndDate}
      </Typography>
      <Typography variant="body2">
        <strong>설명:</strong> {board.taskDescription}
      </Typography>
    </CardContent>
  </Card>
);

// 개별 댓글 아이템 컴포넌트
interface CommentItemProps {
  comment: Comment;
  level: number; // 0: 최상위 댓글, 1: 대댓글
  onAddReply: (parentCommentId: number, replyContent: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, level, onAddReply }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (replyText.trim() === '') return;
    onAddReply(comment.commentId, replyText);
    setReplyText('');
    setShowReplyInput(false);
  };

  return (
    <Box key={comment.commentId} sx={{ mb: 1, pl: level === 1 ? 2 : 0 }}>
      <Typography variant="subtitle2" sx={{ color: level === 1 ? 'gray' : 'inherit' }}>
        {level === 1 && <span style={{ marginRight: 4 }}>ㄴ</span>}
        {comment.commenterUsername} | {comment.commentCreatedAt}
      </Typography>
      <Typography variant="body1" sx={{ color: level === 1 ? 'gray' : 'inherit' }}>
        {level === 1 && <span style={{ marginRight: 4 }}>ㄴ</span>}
        {comment.commentContent}
      </Typography>
      
      {/* 최상위 댓글인 경우에만 Reply 버튼과 입력창 노출 */}
      {level === 0 && (
        <Box sx={{ mt: 1 }}>
          <Button size="small" onClick={() => setShowReplyInput(!showReplyInput)}>
            Reply
          </Button>
          {showReplyInput && (
            <Box sx={{ mt: 1 }}>
              <TextField 
                variant="outlined"
                size="small"
                fullWidth
                placeholder="대댓글을 입력하세요..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <Button variant="contained" size="small" onClick={handleReplySubmit} sx={{ ml: 1, mt: 1 }}>
                등록
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* 대댓글(레벨 1)은 더 이상 대댓글 입력창이 노출되지 않음 */}
      {comment.replies && comment.replies.length > 0 && level < 1 && (
        <Box sx={{ pl: 2, borderLeft: '1px solid #ccc', mt: 1 }}>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.commentId} comment={reply} level={1} onAddReply={onAddReply} />
          ))}
        </Box>
      )}
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
};

interface CommentListProps {
  comments?: Comment[];
  onAddReply: (parentCommentId: number, replyContent: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments = [], onAddReply }) => (
  <List sx={{ pl: 2 }}>
    {comments.map((comment) => (
      <CommentItem key={comment.commentId} comment={comment} level={0} onAddReply={onAddReply} />
    ))}
  </List>
);

const Board: React.FC = () => {
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardData | null>(null);
  const [openDialog, setOpenDialog] = useState(false); // 모달 제어용
  // 신규 댓글 입력 관련 상태
  const [newCommentActive, setNewCommentActive] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

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
        console.error("Error fetching boards:", error);
      });
  };

  const handleBoardClick = (board: BoardData) => {
    setSelectedBoard(board);
    // 댓글 작성 UI 초기화
    setNewCommentActive(false);
    setNewCommentText('');
  };

  const handleNewBoardClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 새 Board 생성 후 목록 리로딩
  const handleBoardCreated = () => {
    handleCloseDialog();
    fetchBoards();
  };

  const handleAddReply = (parentCommentId: number, replyContent: string) => {
    if (!selectedBoard) return;
    
    // 요청 DTO 구조에 맞게 body 구성
    const requestBody = {
      boardId: selectedBoard.boardId,
      content: replyContent,           // replyContent -> content로 변경
      parentCommentId: parentCommentId   // 대댓글의 경우 parentCommentId가 포함됨
    };
  
    axiosInstance
      .post(CollabEase.BOARD.CREATE_COMMENT, requestBody)
      .then((response) => {
        // API 응답으로 새 대댓글 객체를 받는다고 가정 (예: response.data)
        const newReply: Comment = response.data;
        // 재귀적으로 parentCommentId에 해당하는 댓글에 새 대댓글 추가
        const updatedComments = addReplyToComments(selectedBoard.comments, parentCommentId, newReply);
        setSelectedBoard({ ...selectedBoard, comments: updatedComments });
      })
      .catch((error) => {
        console.error('Error adding reply:', error);
      });
  };

  // 재귀적으로 댓글 목록에서 parentCommentId에 해당하는 댓글을 찾아 새 대댓글을 추가하는 함수
  const addReplyToComments = (comments: Comment[], parentId: number, newReply: Comment): Comment[] => {
    return comments.map((comment) => {
      if (comment.commentId === parentId) {
        return { ...comment, replies: [...(comment.replies || []), newReply] };
      } else if (comment.replies && comment.replies.length > 0) {
        return { ...comment, replies: addReplyToComments(comment.replies, parentId, newReply) };
      }
      return comment;
    });
  };
// 최상위 댓글 추가 (신규 댓글 입력)
const handleAddComment = () => {
  if (!selectedBoard) return;
  if (newCommentText.trim() === '') return;

  const requestBody = {
    boardId: selectedBoard.boardId,
    content: newCommentText,        // 신규 댓글의 내용은 content
    parentCommentId: null           // 최상위 댓글은 null 전달
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


  return (
    <CCard maxWidth="md" sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <Paper elevation={1} sx={{ width: '30%', height: 'auto' }}>
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
      <Box sx={{ flexGrow: 1 }}>
        {selectedBoard ? (
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              {selectedBoard.boardTitle}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {selectedBoard.boardContent}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <TaskInfo board={selectedBoard} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              댓글
            </Typography>
            <CommentList comments={selectedBoard.comments} onAddReply={handleAddReply} />

            {/* 최하단 신규 댓글 입력 UI */}
            <Box sx={{ mt: 2 }}>
              {!newCommentActive ? (
                <Box
                  onClick={() => setNewCommentActive(true)}
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px',
                    cursor: 'text',
                    color: '#aaa'
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
            </Box>
          </Paper>
        ) : (
          <Typography variant="h6">게시글을 선택해주세요</Typography>
        )}
      </Box>

      {/* New Board 생성 모달 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <CreateBoardDialog onClose={handleCloseDialog} onBoardCreated={handleBoardCreated} />
      </Dialog>
    </CCard>
  );
};

export default Board;
