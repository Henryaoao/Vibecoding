import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { CourseDetail, CourseItem, CourseProgressUpdateInput } from "@/types/domain";

export function listCourses() {
  return apiRequest<CourseItem[]>({
    path: endpoints.portal.courses
  });
}

export function getCourse(courseId: string) {
  return apiRequest<CourseDetail>({
    path: endpoints.portal.course(courseId)
  });
}

export function updateCourseProgress(courseId: string, input: CourseProgressUpdateInput) {
  return apiRequest<CourseDetail>({
    path: endpoints.portal.courseProgress(courseId),
    method: "POST",
    body: input
  });
}

export function completeCourse(courseId: string) {
  return apiRequest<CourseDetail>({
    path: endpoints.portal.courseComplete(courseId),
    method: "POST"
  });
}
