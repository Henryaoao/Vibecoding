import { router, type Href } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { deleteFavorite, listMyFavorites } from "@/api/me";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, spacing, typography } from "@/theme/tokens";
import type { MeFavoriteItem } from "@/types/domain";

const queryKey = ["mobile", "me", "favorites"] as const;

function favoriteRoute(favorite: MeFavoriteItem): Href {
  switch (favorite.resourceType) {
    case "brief":
      return `/briefs/${favorite.resourceId}` as Href;
    case "announcement":
      return `/announcements/${favorite.resourceId}` as Href;
    case "newcomer":
      return `/newcomer/${favorite.resourceId}` as Href;
    case "document":
      return `/documents/${favorite.resourceId}` as Href;
    case "course":
      return `/training/${favorite.resourceId}` as Href;
    case "finance":
      return `/finance/${favorite.resourceId}` as Href;
  }
}

export default function FavoritesScreen() {
  const queryClient = useQueryClient();
  const { data, error, isFetching, isLoading, refetch } = useQuery({ queryKey, queryFn: listMyFavorites });
  const deleteMutation = useMutation({
    mutationFn: (favorite: MeFavoriteItem) => deleteFavorite(favorite.id),
    onMutate: async (favorite) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<MeFavoriteItem[]>(queryKey, (current) => current?.filter((item) => item.id !== favorite.id));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mobile", "profile"] });
    }
  });

  if (isLoading) {
    return <LoadingState label="正在加载我的收藏..." />;
  }

  if (error) {
    return <ErrorState message="我的收藏加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  const favorites = data ?? [];

  return (
    <Screen>
      <PageHeader title="我的收藏" subtitle="集中查看已收藏的简报、公告、资料、文档、课程和财经轻资讯。" />

      {favorites.length === 0 ? (
        <EmptyState title="暂无收藏" description="收藏内容后会显示在这里。" />
      ) : (
        favorites.map((favorite) => (
          <Card key={favorite.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`查看收藏 ${favorite.title}`}
              onPress={() => router.push(favoriteRoute(favorite))}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <View style={styles.cardBody}>
                <Text style={styles.title}>{favorite.title}</Text>
                <Text style={styles.summary}>{favorite.subtitle}</Text>
                <Text style={styles.meta}>收藏时间：{favorite.favoritedAt}</Text>
              </View>
            </Pressable>
            <AppButton
              label="取消收藏"
              variant="secondary"
              accessibilityLabel={`取消收藏 ${favorite.title}`}
              loading={deleteMutation.isPending && deleteMutation.variables?.id === favorite.id}
              disabled={deleteMutation.isPending && deleteMutation.variables?.id === favorite.id}
              onPress={() => deleteMutation.mutate(favorite)}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  summary: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  pressed: {
    opacity: 0.85
  }
});
