import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, type Href, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  archiveAdminCourse,
  createAdminCourse,
  deleteAdminCourse,
  getAdminCourse,
  publishAdminCourse,
  updateAdminCourse
} from "@/api/admin";
import { AdminActionConfirmation } from "@/components/AdminActionConfirmation";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { AdminCourseItem, AdminCourseUpsertInput } from "@/types/domain";

const defaultDraft: AdminCourseUpsertInput = {
  title: "",
  summary: "",
  required: true,
  material_document_id: null,
  external_url: null
};

type ConfirmationAction = "publish" | "archive" | "delete";

const confirmationCopy: Record<
  ConfirmationAction,
  {
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant?: "primary" | "danger";
  }
> = {
  publish: {
    title: "确认发布课程",
    message: "发布后有权限的用户可在培训中心看到该课程。请确认当前单条课程信息无误。",
    confirmLabel: "确认发布"
  },
  archive: {
    title: "确认归档课程",
    message: "归档后该课程将从普通用户培训中心发布列表中移除。",
    confirmLabel: "确认归档"
  },
  delete: {
    title: "确认软删除课程",
    message: "软删除后该课程不再对普通用户可见，并保留审计所需记录。",
    confirmLabel: "确认软删除",
    confirmVariant: "danger"
  }
};

export default function AdminCourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const courseId = Array.isArray(id) ? id[0] : id;
  const isNew = !courseId || courseId === "new";
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminCourseUpsertInput>(defaultDraft);
  const [record, setRecord] = useState<AdminCourseItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null);

  const query = useQuery({
    queryKey: ["mobile", "admin", "courses", courseId],
    queryFn: () => getAdminCourse(courseId ?? ""),
    enabled: !isNew && Boolean(courseId)
  });

  useEffect(() => {
    if (query.data) {
      setRecord(query.data);
      setForm({
        title: query.data.title,
        summary: query.data.summary,
        required: query.data.required,
        material_document_id: query.data.material_document_id,
        external_url: query.data.external_url
      });
    }
  }, [query.data]);

  const savedRecord = record ?? query.data ?? null;
  const canMutateExisting = Boolean(savedRecord?.id && !savedRecord.deleted_at);
  const title = useMemo(() => (isNew ? "新建课程" : "编辑课程"), [isNew]);

  function updateForm(key: keyof AdminCourseUpsertInput, value: string) {
    setForm((current) => ({
      ...current,
      [key]: key === "required" ? value === "true" : value || null
    }));
  }

  function afterMutation(nextRecord: AdminCourseItem, nextNotice: string) {
    setRecord(nextRecord);
    setNotice(nextNotice);
    setConfirmationAction(null);
    queryClient.invalidateQueries({ queryKey: ["mobile", "admin", "courses"] });
    queryClient.setQueryData(["mobile", "admin", "courses", nextRecord.id], nextRecord);
  }

  const saveMutation = useMutation({
    mutationFn: () => (savedRecord ? updateAdminCourse(savedRecord.id, form) : createAdminCourse(form)),
    onSuccess: (nextRecord) => {
      afterMutation(nextRecord, savedRecord ? "课程已更新" : "课程草稿已保存");
      if (isNew) {
        router.replace(`/admin/courses/${nextRecord.id}` as Href);
      }
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => publishAdminCourse(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "课程已发布")
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveAdminCourse(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "课程已归档")
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminCourse(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "课程已软删除")
  });

  const activeConfirmation = confirmationAction ? confirmationCopy[confirmationAction] : null;
  const confirmationLoading = publishMutation.isPending || archiveMutation.isPending || deleteMutation.isPending;

  function confirmProtectedAction() {
    if (confirmationAction === "publish") {
      publishMutation.mutate();
      return;
    }
    if (confirmationAction === "archive") {
      archiveMutation.mutate();
      return;
    }
    if (confirmationAction === "delete") {
      deleteMutation.mutate();
    }
  }

  if (query.isLoading) {
    return <LoadingState label="正在加载课程详情..." />;
  }

  if (query.error) {
    return <ErrorState message="课程详情加载失败" retrying={query.isFetching} onRetry={() => query.refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title={title} subtitle="移动端 Admin 第一版只支持单条课程操作，不支持批量操作。" />
      <Card>
        <Text style={styles.label}>标题</Text>
        <TextInput placeholder="标题" style={styles.input} value={form.title} onChangeText={(value) => updateForm("title", value)} />
        <Text style={styles.label}>简介</Text>
        <TextInput
          placeholder="简介"
          multiline
          style={[styles.input, styles.textarea]}
          value={form.summary}
          onChangeText={(value) => updateForm("summary", value)}
        />
        <Text style={styles.label}>必修</Text>
        <TextInput
          accessibilityLabel="必修"
          style={styles.input}
          value={String(form.required)}
          onChangeText={(value) => updateForm("required", value)}
        />
        <Text style={styles.label}>关联文档 ID</Text>
        <TextInput
          accessibilityLabel="关联文档 ID"
          style={styles.input}
          value={form.material_document_id ?? ""}
          onChangeText={(value) => updateForm("material_document_id", value)}
        />
        <Text style={styles.label}>外部课程链接</Text>
        <TextInput
          accessibilityLabel="外部课程链接"
          style={styles.input}
          value={form.external_url ?? ""}
          onChangeText={(value) => updateForm("external_url", value)}
        />
      </Card>

      <Card>
        <Text style={styles.status}>状态：{savedRecord?.status ?? "draft"}</Text>
        {savedRecord?.deleted_at ? <Text style={styles.danger}>已软删除</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </Card>

      {activeConfirmation ? (
        <AdminActionConfirmation
          title={activeConfirmation.title}
          message={activeConfirmation.message}
          confirmLabel={activeConfirmation.confirmLabel}
          confirmVariant={activeConfirmation.confirmVariant}
          loading={confirmationLoading}
          onCancel={() => setConfirmationAction(null)}
          onConfirm={confirmProtectedAction}
        />
      ) : null}

      <View style={styles.actions}>
        <AppButton label="保存草稿" onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} />
        <AppButton label="发布" disabled={!canMutateExisting} onPress={() => setConfirmationAction("publish")} loading={publishMutation.isPending} />
        <AppButton
          label="归档"
          variant="secondary"
          disabled={!canMutateExisting}
          onPress={() => setConfirmationAction("archive")}
          loading={archiveMutation.isPending}
        />
        <AppButton
          label="软删除"
          variant="danger"
          disabled={!canMutateExisting}
          onPress={() => setConfirmationAction("delete")}
          loading={deleteMutation.isPending}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    backgroundColor: colors.background
  },
  textarea: {
    minHeight: 96,
    paddingTop: spacing.md,
    textAlignVertical: "top"
  },
  status: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "800"
  },
  notice: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: "700"
  },
  danger: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: "800"
  },
  actions: {
    gap: spacing.sm
  }
});
