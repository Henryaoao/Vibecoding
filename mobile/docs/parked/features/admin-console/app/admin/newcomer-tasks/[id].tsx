import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, type Href, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  createAdminNewcomerTask,
  disableAdminNewcomerTask,
  enableAdminNewcomerTask,
  getAdminNewcomerTask,
  updateAdminNewcomerTask
} from "@/api/admin";
import { AdminActionConfirmation } from "@/components/AdminActionConfirmation";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { AdminNewcomerTaskItem, AdminNewcomerTaskUpsertInput } from "@/types/domain";

const defaultDraft: AdminNewcomerTaskUpsertInput = {
  title: "",
  description: "",
  sort_order: 10
};

export default function AdminNewcomerTaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;
  const isNew = !taskId || taskId === "new";
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminNewcomerTaskUpsertInput>(defaultDraft);
  const [record, setRecord] = useState<AdminNewcomerTaskItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const query = useQuery({
    queryKey: ["mobile", "admin", "newcomer-tasks", taskId],
    queryFn: () => getAdminNewcomerTask(taskId ?? ""),
    enabled: !isNew && Boolean(taskId)
  });

  useEffect(() => {
    if (query.data) {
      setRecord(query.data);
      setForm({
        title: query.data.title,
        description: query.data.description,
        sort_order: query.data.sort_order
      });
    }
  }, [query.data]);

  const savedRecord = record ?? query.data ?? null;
  const canMutateExisting = Boolean(savedRecord?.id && !savedRecord.deleted_at);
  const title = useMemo(() => (isNew ? "新建新人任务" : "编辑新人任务"), [isNew]);

  function updateForm(key: keyof AdminNewcomerTaskUpsertInput, value: string) {
    setForm((current) => ({
      ...current,
      [key]: key === "sort_order" ? Number(value) || 0 : value
    }));
  }

  function afterMutation(nextRecord: AdminNewcomerTaskItem, nextNotice: string) {
    setRecord(nextRecord);
    setNotice(nextNotice);
    setConfirmDisable(false);
    queryClient.invalidateQueries({ queryKey: ["mobile", "admin", "newcomer-tasks"] });
    queryClient.setQueryData(["mobile", "admin", "newcomer-tasks", nextRecord.id], nextRecord);
  }

  const saveMutation = useMutation({
    mutationFn: () => (savedRecord ? updateAdminNewcomerTask(savedRecord.id, form) : createAdminNewcomerTask(form)),
    onSuccess: (nextRecord) => {
      afterMutation(nextRecord, savedRecord ? "新人任务已更新" : "新人任务已保存");
      if (isNew) {
        router.replace(`/admin/newcomer-tasks/${nextRecord.id}` as Href);
      }
    }
  });

  const enableMutation = useMutation({
    mutationFn: () => enableAdminNewcomerTask(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "新人任务已启用")
  });

  const disableMutation = useMutation({
    mutationFn: () => disableAdminNewcomerTask(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "新人任务已禁用")
  });

  if (query.isLoading) {
    return <LoadingState label="正在加载新人任务详情..." />;
  }

  if (query.error) {
    return <ErrorState message="新人任务详情加载失败" retrying={query.isFetching} onRetry={() => query.refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title={title} subtitle="移动端 Admin 第一版只支持单条新人任务操作，不支持批量操作。" />
      <Card>
        <Text style={styles.label}>标题</Text>
        <TextInput placeholder="标题" style={styles.input} value={form.title} onChangeText={(value) => updateForm("title", value)} />
        <Text style={styles.label}>说明</Text>
        <TextInput
          placeholder="说明"
          multiline
          style={[styles.input, styles.textarea]}
          value={form.description}
          onChangeText={(value) => updateForm("description", value)}
        />
        <Text style={styles.label}>排序</Text>
        <TextInput
          accessibilityLabel="排序"
          keyboardType="number-pad"
          style={styles.input}
          value={String(form.sort_order)}
          onChangeText={(value) => updateForm("sort_order", value)}
        />
      </Card>

      <Card>
        <Text style={styles.status}>状态：{savedRecord?.enabled ? "enabled" : "disabled"}</Text>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </Card>

      {confirmDisable ? (
        <AdminActionConfirmation
          title="确认禁用新人任务"
          message="禁用后普通用户不再看到该新人任务，已完成记录仍由后端保留。"
          confirmLabel="确认执行"
          loading={disableMutation.isPending}
          onCancel={() => setConfirmDisable(false)}
          onConfirm={() => disableMutation.mutate()}
        />
      ) : null}

      <View style={styles.actions}>
        <AppButton label="保存任务" onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} />
        <AppButton label="启用" disabled={!canMutateExisting} onPress={() => enableMutation.mutate()} loading={enableMutation.isPending} />
        <AppButton
          label="禁用"
          variant="secondary"
          disabled={!canMutateExisting}
          onPress={() => setConfirmDisable(true)}
          loading={disableMutation.isPending}
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
  actions: {
    gap: spacing.sm
  }
});
