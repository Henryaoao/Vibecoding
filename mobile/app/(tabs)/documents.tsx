import { useEffect, useMemo, useState } from "react";
import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PixelTextInput } from "@/components/PixelTextInput";
import { listDocuments } from "@/api/documents";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ModuleListStatus } from "@/components/ModuleListControls";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { DocumentItem } from "@/types/domain";

function uniqueValues<T extends string>(values: T[]) {
  return Array.from(new Set(values));
}

export default function DocumentsScreen() {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [selectedFileType, setSelectedFileType] = useState<DocumentItem["fileType"] | undefined>();
  const trimmedKeyword = keyword.trim();
  const query = {
    search: trimmedKeyword,
    category: selectedCategory,
    tag: selectedTag,
    fileType: selectedFileType
  };
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "documents", { search: trimmedKeyword, category: selectedCategory ?? "all", tag: selectedTag ?? "all", fileType: selectedFileType ?? "all" }],
    queryFn: () => listDocuments(query)
  });

  const documents = data ?? [];
  const [facetDocuments, setFacetDocuments] = useState<DocumentItem[]>([]);
  useEffect(() => {
    if (data && !trimmedKeyword && !selectedCategory && !selectedTag && !selectedFileType) {
      setFacetDocuments(data);
    }
  }, [data, selectedCategory, selectedFileType, selectedTag, trimmedKeyword]);

  const permittedDocuments = facetDocuments.length > 0 ? facetDocuments : documents;
  const documentCategories = useMemo(() => uniqueValues(permittedDocuments.map((document) => document.category)), [permittedDocuments]);
  const documentTags = useMemo(() => uniqueValues(permittedDocuments.flatMap((document) => document.tags)), [permittedDocuments]);
  const documentFileTypes = useMemo(() => uniqueValues(permittedDocuments.map((document) => document.fileType)), [permittedDocuments]);
  const activeFilterText = useMemo(() => {
    const filters = [trimmedKeyword ? `关键词：${trimmedKeyword}` : null, selectedCategory, selectedTag, selectedFileType?.toUpperCase()].filter(Boolean);
    return filters.length ? `当前筛选：${filters.join(" / ")}` : "当前筛选：全部文档";
  }, [trimmedKeyword, selectedCategory, selectedTag, selectedFileType]);
  const hasActiveFilters = Boolean(trimmedKeyword || selectedCategory || selectedTag || selectedFileType);

  if (isLoading) {
    return <LoadingState label="正在加载文档..." />;
  }

  if (error) {
    return <ErrorState message="文档中心加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="文档中心" subtitle="查看已发布且有权限访问的制度、模板和流程文件。" />
      <PixelTextInput
        accessibilityLabel="搜索文档"
        value={keyword}
        onChangeText={setKeyword}
        placeholder="搜索标题、分类或标签"
      />

      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>分类</Text>
        <View style={styles.filters}>
          <AppButton label="全部" variant={!selectedCategory ? "primary" : "secondary"} onPress={() => setSelectedCategory(undefined)} />
          {documentCategories.map((category) => (
            <AppButton
              key={category}
              label={category}
              accessibilityLabel={`按${category}筛选文档`}
              variant={selectedCategory === category ? "primary" : "secondary"}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </View>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>标签</Text>
        <View style={styles.filters}>
          <AppButton label="全部标签" variant={!selectedTag ? "primary" : "secondary"} onPress={() => setSelectedTag(undefined)} />
          {documentTags.map((tag) => (
            <AppButton
              key={tag}
              label={tag}
              accessibilityLabel={`按${tag}筛选文档标签`}
              variant={selectedTag === tag ? "primary" : "secondary"}
              onPress={() => setSelectedTag(tag)}
            />
          ))}
        </View>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>文件类型</Text>
        <View style={styles.filters}>
          <AppButton label="全部类型" variant={!selectedFileType ? "primary" : "secondary"} onPress={() => setSelectedFileType(undefined)} />
          {documentFileTypes.map((fileType) => (
            <AppButton
              key={fileType}
              label={fileType.toUpperCase()}
              accessibilityLabel={`按${fileType.toUpperCase()}筛选文档类型`}
              variant={selectedFileType === fileType ? "primary" : "secondary"}
              onPress={() => setSelectedFileType(fileType)}
            />
          ))}
        </View>
      </View>

      <ModuleListStatus
        label="文档中心"
        count={documents.length}
        activeSummary={activeFilterText}
        onReset={
          hasActiveFilters
            ? () => {
                setKeyword("");
                setSelectedCategory(undefined);
                setSelectedTag(undefined);
                setSelectedFileType(undefined);
              }
            : undefined
        }
      />

      {documents.length === 0 ? (
        <EmptyState title="没有匹配的文档" description="换个关键词、分类、标签或文件类型再试试。" />
      ) : (
        documents.map((document) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`查看文档 ${document.title}`}
            key={document.id}
            onPress={() => router.push(`/documents/${document.id}` as Href)}
            style={({ pressed }) => [pressed ? styles.pressed : null]}
          >
            <Card>
              <Text style={styles.title}>{document.title}</Text>
              <Text style={styles.meta}>
                {document.category} · {document.fileType.toUpperCase()} · {document.sizeLabel}
              </Text>
              <Text style={styles.tags}>标签：{document.tags.join(" / ")}</Text>
              <Text style={styles.meta}>更新于 {document.updatedAt}</Text>
              <Text style={document.canPreview ? styles.preview : styles.denied}>
                {document.canPreview ? "可预览 / 可下载" : "无预览权限"}
              </Text>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterGroup: {
    gap: spacing.sm
  },
  filterTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  tags: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "700"
  },
  preview: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: "700"
  },
  denied: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.85
  }
});
