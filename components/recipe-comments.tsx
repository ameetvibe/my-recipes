"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Send, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
  users: {
    username: string
    avatar_url: string | null
  }
  parent_comment_id?: string
  replies?: Comment[]
}

interface RecipeCommentsProps {
  recipeId: string
  initialComments?: Comment[]
}

export function RecipeComments({ recipeId, initialComments = [] }: RecipeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const supabase = createClient()

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isLoading) return

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Authentication Required", {
          description: "Please sign in to leave comments.",
        })
        return
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          content: newComment.trim(),
          parent_comment_id: replyingTo || null
        })
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          parent_comment_id,
          users!inner(username, avatar_url)
        `)
        .single()

      if (error) throw error

      const newCommentData: Comment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
        users: data.users,
        parent_comment_id: data.parent_comment_id
      }

      if (replyingTo) {
        // Add as reply
        setComments(prev => prev.map(comment => 
          comment.id === replyingTo 
            ? { ...comment, replies: [...(comment.replies || []), newCommentData] }
            : comment
        ))
        setReplyingTo(null)
        setReplyContent("")
      } else {
        // Add as top-level comment
        setComments(prev => [newCommentData, ...prev])
      }

      setNewComment("")
      toast.success("Comment Added", {
        description: "Your comment has been posted successfully.",
      })

    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error("Error", {
        description: "Failed to add comment. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || isLoading) return

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Authentication Required", {
          description: "Please sign in to reply to comments.",
        })
        return
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          content: replyContent.trim(),
          parent_comment_id: parentCommentId
        })
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          parent_comment_id,
          users!inner(username, avatar_url)
        `)
        .single()

      if (error) throw error

      const newReply: Comment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
        users: data.users,
        parent_comment_id: data.parent_comment_id
      }

      setComments(prev => prev.map(comment => 
        comment.id === parentCommentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ))

      setReplyContent("")
      toast.success("Reply Added", {
        description: "Your reply has been posted successfully.",
      })

    } catch (error) {
      console.error('Error adding reply:', error)
      toast.error("Error", {
        description: "Failed to add reply. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.users.avatar_url || undefined} alt={comment.users.username} />
              <AvatarFallback className="text-xs">
                {comment.users.username.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{comment.users.username}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-foreground mb-3">{comment.content}</p>
        
        {/* Reply button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="text-xs"
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Reply
        </Button>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2"
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleReply(comment.id)}
                disabled={!replyContent.trim() || isLoading}
              >
                <Send className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 ml-4 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Leave a Comment</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Share your thoughts about this recipe..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newComment.trim() || isLoading}>
                {isLoading ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
