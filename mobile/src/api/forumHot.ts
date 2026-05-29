import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { ForumHotPostDetail, ForumHotPostItem } from "@/types/domain";

export function calculateForumHotness(post: Pick<ForumHotPostItem, "viewCount" | "commentCount" | "likeCount">) {
  return post.viewCount + post.commentCount * 3 + post.likeCount * 2;
}

export function sortForumHotPosts(posts: ForumHotPostItem[]) {
  return [...posts].sort((left, right) => {
    if (left.configuredOrder !== undefined || right.configuredOrder !== undefined) {
      return (left.configuredOrder ?? Number.MAX_SAFE_INTEGER) - (right.configuredOrder ?? Number.MAX_SAFE_INTEGER);
    }

    return right.hotnessScore - left.hotnessScore;
  });
}

export function listForumHotPosts() {
  return apiRequest<ForumHotPostItem[]>({
    path: endpoints.portal.forumHot
  });
}

export function getForumHotPost(postId: string) {
  return apiRequest<ForumHotPostDetail>({
    path: endpoints.portal.forumHotPost(postId)
  });
}
