import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, type Href, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  createAdminUser,
  disableAdminUser,
  getAdminUser,
  updateAdminUser,
  updateAdminUserRole
} from "@/api/admin";
import { isApiError } from "@/api/errors";
import { AdminActionConfirmation } from "@/components/AdminActionConfirmation";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { AdminUserItem, AdminUserUpsertInput, Role } from "@/types/domain";

const defaultDraft: AdminUserUpsertInput = {
  name: "",
  email: "",
  department: "",
  role: "user"
};

type ConfirmationAction = "set-user" | "set-super-user" | "disable";

const confirmationCopy: Record<ConfirmationAction, { title: string; message: string; confirmLabel: string; confirmVariant?: "primary" | "danger" }> = {
  "set-user": {
    title: "确认修改用户角色",
    message: "确认将该用户角色调整为 user。角色变更会影响 Admin Console 访问权限。",
    confirmLabel: "确认执行"
  },
  "set-super-user": {
    title: "确认修改用户角色",
    message: "确认将该用户角色调整为 super_user。该用户将获得移动端 Admin Console 权限。",
    confirmLabel: "确认执行"
  },
  disable: {
    title: "确认禁用用户",
    message: "禁用后该用户将无法继续使用移动端账号，请确认不是最后一个启用状态的 super_user。",
    confirmLabel: "确认执行",
    confirmVariant: "danger"
  }
};

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const userId = Array.isArray(id) ? id[0] : id;
  const isNew = !userId || userId === "new";
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminUserUpsertInput>(defaultDraft);
  const [record, setRecord] = useState<AdminUserItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null);

  const query = useQuery({
    queryKey: ["mobile", "admin", "users", userId],
    queryFn: () => getAdminUser(userId ?? ""),
    enabled: !isNew && Boolean(userId)
  });

  useEffect(() => {
    if (query.data) {
      setRecord(query.data);
      setForm({
        name: query.data.name,
        email: query.data.email,
        department: query.data.department,
        role: query.data.role
      });
    }
  }, [query.data]);

  const savedRecord = record ?? query.data ?? null;
  const canMutateExisting = Boolean(savedRecord?.id && savedRecord.enabled && !savedRecord.deleted_at);
  const title = useMemo(() => (isNew ? "新建用户" : "编辑用户"), [isNew]);

  function updateForm(key: keyof AdminUserUpsertInput, value: string) {
    setForm((current) => ({ ...current, [key]: key === "role" ? (value as Role) : value }));
  }

  function afterMutation(nextRecord: AdminUserItem, nextNotice: string) {
    setRecord(nextRecord);
    setErrorNotice(null);
    setForm({
      name: nextRecord.name,
      email: nextRecord.email,
      department: nextRecord.department,
      role: nextRecord.role
    });
    setNotice(nextNotice);
    setConfirmationAction(null);
    queryClient.invalidateQueries({ queryKey: ["mobile", "admin", "users"] });
    queryClient.setQueryData(["mobile", "admin", "users", nextRecord.id], nextRecord);
  }

  function showMutationError(caught: unknown) {
    setNotice(null);
    setErrorNotice(isApiError(caught) ? caught.message : "操作失败，请稍后重试");
  }

  const saveMutation = useMutation({
    mutationFn: () => (savedRecord ? updateAdminUser(savedRecord.id, form) : createAdminUser(form)),
    onSuccess: (nextRecord) => {
      afterMutation(nextRecord, savedRecord ? "用户已更新" : "用户已保存");
      if (isNew) {
        router.replace(`/admin/users/${nextRecord.id}` as Href);
      }
    },
    onError: showMutationError
  });

  const userRoleMutation = useMutation({
    mutationFn: () => updateAdminUserRole(savedRecord?.id ?? "", { role: "user" }),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "角色已更新"),
    onError: showMutationError
  });

  const superUserRoleMutation = useMutation({
    mutationFn: () => updateAdminUserRole(savedRecord?.id ?? "", { role: "super_user" }),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "角色已更新"),
    onError: showMutationError
  });

  const disableMutation = useMutation({
    mutationFn: () => disableAdminUser(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "用户已禁用"),
    onError: showMutationError
  });

  const activeConfirmation = confirmationAction ? confirmationCopy[confirmationAction] : null;
  const confirmationLoading = userRoleMutation.isPending || superUserRoleMutation.isPending || disableMutation.isPending;

  function confirmProtectedAction() {
    if (confirmationAction === "set-user") {
      userRoleMutation.mutate();
      return;
    }
    if (confirmationAction === "set-super-user") {
      superUserRoleMutation.mutate();
      return;
    }
    if (confirmationAction === "disable") {
      disableMutation.mutate();
    }
  }

  if (query.isLoading) {
    return <LoadingState label="正在加载用户详情..." />;
  }

  if (query.error) {
    return <ErrorState message="用户详情加载失败" retrying={query.isFetching} onRetry={() => query.refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title={title} subtitle="移动端 Admin 第一版只支持单条用户操作，角色仅限 user 或 super_user。" />
      <Card>
        <Text style={styles.label}>姓名</Text>
        <TextInput placeholder="姓名" style={styles.input} value={form.name} onChangeText={(value) => updateForm("name", value)} />
        <Text style={styles.label}>邮箱</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="邮箱"
          style={styles.input}
          value={form.email}
          onChangeText={(value) => updateForm("email", value)}
        />
        <Text style={styles.label}>部门</Text>
        <TextInput placeholder="部门" style={styles.input} value={form.department} onChangeText={(value) => updateForm("department", value)} />
        <Text style={styles.label}>新用户角色</Text>
        <View style={styles.roleActions}>
          <AppButton label="选择普通用户" variant={form.role === "user" ? "secondary" : "primary"} onPress={() => updateForm("role", "user")} />
          <AppButton
            label="选择超级用户"
            variant={form.role === "super_user" ? "secondary" : "primary"}
            onPress={() => updateForm("role", "super_user")}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.status}>角色：{savedRecord?.role ?? form.role}</Text>
        <Text style={styles.status}>状态：{savedRecord?.enabled === false ? "disabled" : "enabled"}</Text>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {errorNotice ? <Text style={styles.errorNotice}>{errorNotice}</Text> : null}
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
        <AppButton label="保存用户" onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} />
        <AppButton label="设为普通用户" disabled={!canMutateExisting} onPress={() => setConfirmationAction("set-user")} loading={userRoleMutation.isPending} />
        <AppButton
          label="设为超级用户"
          disabled={!canMutateExisting}
          onPress={() => setConfirmationAction("set-super-user")}
          loading={superUserRoleMutation.isPending}
        />
        <AppButton
          label="禁用用户"
          variant="danger"
          disabled={!canMutateExisting}
          onPress={() => setConfirmationAction("disable")}
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
  errorNotice: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: "700"
  },
  actions: {
    gap: spacing.sm
  },
  roleActions: {
    gap: spacing.sm
  }
});
