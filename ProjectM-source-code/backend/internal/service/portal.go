package service

import (
	"context"
	"sort"
	"time"

	"projectm/backend/internal/model"
)

type ContentRepository interface {
	LoadHomeSections(ctx context.Context) (map[string][]model.ContentItem, error)
	LoadSection(ctx context.Context, section string, limit int) ([]model.ContentItem, error)
}

type PortalService struct {
	contentRepository ContentRepository
}

func NewPortalService(contentRepository ContentRepository) *PortalService {
	return &PortalService{contentRepository: contentRepository}
}

func (s *PortalService) LoadHome(ctx context.Context) (model.HomeResponse, error) {
	sections := make([]model.SectionSummary, 0, len(model.SectionOrder))
	pinned := make([]model.ContentItem, 0, 4)
	latest := make([]model.ContentItem, 0, len(model.SectionOrder)*3)

	sectionItems, err := s.contentRepository.LoadHomeSections(ctx)
	if err != nil {
		return model.HomeResponse{}, err
	}

	for _, section := range model.SectionOrder {
		items := sectionItems[section]
		sections = append(sections, model.SectionSummary{
			Section: section,
			Label:   model.SectionLabels[section],
			Count:   len(items),
			Items:   items,
		})
		for _, item := range items {
			if item.Pinned {
				pinned = append(pinned, item)
			}
			latest = append(latest, item)
		}
	}

	sort.SliceStable(latest, func(i, j int) bool {
		return latest[i].PublishedAt > latest[j].PublishedAt
	})
	if len(latest) > 12 {
		latest = latest[:12]
	}

	return model.HomeResponse{
		GeneratedAt: time.Now().Format(time.RFC3339),
		Sections:    sections,
		Pinned:      pinned,
		Latest:      latest,
	}, nil
}

func (s *PortalService) LoadContent(ctx context.Context, section string, limit int) (model.ContentResponse, error) {
	if _, ok := model.SectionLabels[section]; !ok {
		return model.ContentResponse{}, ErrUnknownSection
	}

	items, err := s.contentRepository.LoadSection(ctx, section, limit)
	if err != nil {
		return model.ContentResponse{}, err
	}

	return model.ContentResponse{
		Section: section,
		Label:   model.SectionLabels[section],
		Items:   items,
	}, nil
}
