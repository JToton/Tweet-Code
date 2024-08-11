import React, { useState } from "react";
import {
  VStack,
  Box,
  Text,
  Button,
  Textarea,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_COMMENT,
  UPDATE_COMMENT,
  DELETE_COMMENT,
  MARK_AS_SOLUTION,
  VOTE_COMMENT,
} from "../../graphQL/mutations";
import { GET_PROBLEM } from "../../graphQL/queries";
import CodeEditor from "../features/CodeEditor/CodeEditor";

// Comment component to render individual comments
const Comment = ({
  comment,
  onDelete,
  onUpdate,
  onMarkSolution,
  onVote,
  isAuthor,
  currentUserId,
}) => {
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [editedCode, setEditedCode] = useState(comment.code || "");
  const [editedLanguage, setEditedLanguage] = useState(
    comment.language || "javascript"
  );

  // Handler for updating the comment
  const handleUpdate = () => {
    onUpdate(comment._id, editedContent, editedCode, editedLanguage);
    setIsEditing(false);
  };

  // Check if the current user is the author of the comment
  const isCommentAuthor = currentUserId === comment.author._id;

  return (
    <Box
      borderWidth="1px"
      p={3}
      borderRadius="md"
      bg="palette.darkgrey"
      color="palette.white"
    >
      {isEditing ? (
        // Editing mode UI
        <VStack spacing={4} align="stretch">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            bg="palette.grey"
            color="palette.white"
            minHeight="100px"
          />
          <Box height="30vh" width="100%">
            <CodeEditor
              initialCode={editedCode}
              onCodeChange={setEditedCode}
              language={editedLanguage}
              onLanguageChange={setEditedLanguage}
            />
          </Box>
          <HStack>
            <Button onClick={handleUpdate} colorScheme="green">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} colorScheme="red">
              Cancel
            </Button>
          </HStack>
        </VStack>
      ) : (
        // Display mode UI
        <>
          <Text>{comment.content}</Text>
          {comment.code && (
            <Box height="30vh" width="100%">
              <CodeEditor
                initialCode={comment.code || ""}
                initialLanguage={comment.language || "javascript"}
                readOnly={true}
              />
            </Box>
          )}
          <Text fontSize="sm" color="palette.cyan" mt={2}>
            By {comment.author.username} on{" "}
            {new Date(parseInt(comment.createdAt)).toLocaleString()}
          </Text>
          <HStack mt={2}>
            {/* Voting buttons */}
            <Button
              size="sm"
              onClick={() => onVote(comment._id, 1)}
              colorScheme="blue"
            >
              Upvote ({comment.votes?.filter((v) => v.value === 1).length || 0})
            </Button>
            <Button
              size="sm"
              onClick={() => onVote(comment._id, -1)}
              colorScheme="red"
            >
              Downvote (
              {comment.votes?.filter((v) => v.value === -1).length || 0})
            </Button>
            {/* Mark as solution button (only visible to problem author) */}
            {isAuthor && !comment.isSolution && (
              <Button
                size="sm"
                onClick={() => onMarkSolution(comment._id)}
                colorScheme="green"
              >
                Mark as Solution
              </Button>
            )}
            {/* Edit and Delete buttons (only visible to comment author) */}
            {isCommentAuthor && (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  colorScheme="yellow"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => onDelete(comment._id)}
                  colorScheme="red"
                >
                  Delete
                </Button>
              </>
            )}
          </HStack>
        </>
      )}
    </Box>
  );
};

// Main CommentSection component
const CommentSection = ({
  problemId,
  isAuthor,
  currentUserId,
  displayMode = "all",
}) => {
  // State for new comment form
  const [newComment, setNewComment] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLanguage, setNewLanguage] = useState("javascript");
  const toast = useToast();

  // Query to fetch problem data (including comments)
  const { loading, error, data, refetch } = useQuery(GET_PROBLEM, {
    variables: { _id: problemId },
  });

  // Mutation to add a new comment
  const [addComment] = useMutation(ADD_COMMENT, {
    // Update Apollo cache after adding a comment
    update(cache, { data: { addComment } }) {
      const existingProblem = cache.readQuery({
        query: GET_PROBLEM,
        variables: { _id: problemId },
      });

      if (existingProblem && existingProblem.problem) {
        cache.writeQuery({
          query: GET_PROBLEM,
          variables: { _id: problemId },
          data: {
            problem: {
              ...existingProblem.problem,
              comments: [...existingProblem.problem.comments, addComment],
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Error adding comment",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Other mutations
  const [updateComment] = useMutation(UPDATE_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);
  const [markAsSolution] = useMutation(MARK_AS_SOLUTION);
  const [voteComment] = useMutation(VOTE_COMMENT);

  // Handler to add a new comment
  const handleAddComment = async () => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to add a comment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addComment({
        variables: {
          problemId,
          content: newComment,
          code: newCode,
          language: newLanguage,
        },
      });
      setNewComment("");
      setNewCode("");
      setNewLanguage("javascript");
      toast({
        title: "Comment added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch(); // Refetch problem data after adding a new comment
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handler to update an existing comment
  const handleUpdateComment = async (commentId, content, code, language) => {
    try {
      await updateComment({
        variables: { commentId, content, code, language },
      });
      refetch(); // Refetch to update the comment list
      toast({
        title: "Comment updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating comment.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handler to delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment({
        variables: { commentId },
      });
      refetch(); // Refetch to update the comment list
      toast({
        title: "Comment deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting comment.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handler to mark a comment as solution
  const handleMarkSolution = async (commentId) => {
    try {
      await markAsSolution({
        variables: { commentId },
      });
      refetch(); // Refetch to update the comment list
      toast({
        title: "Comment marked as solution.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error marking comment as solution.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handler to vote on a comment
  const handleVote = async (commentId, value) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await voteComment({
        variables: { commentId, value },
      });
      refetch(); // Refetch to update the vote count
      toast({
        title: "Vote recorded.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error voting on comment.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to render existing comments
  const renderExistingComments = () => {
    if (loading) return <Text>Loading comments...</Text>;
    if (error) return <Text>Error loading comments: {error.message}</Text>;

    const comments = data?.problem?.comments || [];

    return (
      <VStack spacing={4} align="stretch">
        {comments.map((comment) =>
          comment && comment._id ? (
            <Comment
              key={comment._id}
              comment={comment}
              onDelete={handleDeleteComment}
              onUpdate={handleUpdateComment}
              onMarkSolution={handleMarkSolution}
              onVote={handleVote}
              isAuthor={isAuthor}
              currentUserId={currentUserId}
            />
          ) : null
        )}
      </VStack>
    );
  };

  // Function to render the new comment form
  const renderNewCommentForm = () => (
    <Box>
      <Textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        bg="palette.grey"
        color="palette.white"
        mb={2}
      />
      <Box height="30vh" width="100%" mb={2}>
        <CodeEditor
          initialCode={newCode}
          onCodeChange={setNewCode}
          initialLanguage={newLanguage}
          onLanguageChange={setNewLanguage}
        />
      </Box>
      <Button onClick={handleAddComment} colorScheme="blue">
        Add Comment
      </Button>
    </Box>
  );

  // Render based on displayMode
  if (displayMode === "existing") {
    return renderExistingComments();
  } else if (displayMode === "new") {
    return renderNewCommentForm();
  }

  // If displayMode is "all" or not specified, render both
  return (
    <VStack spacing={4} align="stretch">
      {renderExistingComments()}
      {renderNewCommentForm()}
    </VStack>
  );
};

export default CommentSection;
