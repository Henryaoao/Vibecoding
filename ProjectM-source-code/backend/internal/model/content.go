package model

type ContentItem struct {
	ID          string   `json:"id"`
	Section     string   `json:"section"`
	Title       string   `json:"title"`
	Summary     string   `json:"summary"`
	Category    string   `json:"category"`
	ImageURL    string   `json:"imageUrl"`
	Body        string   `json:"body"`
	Status      string   `json:"status"`
	Pinned      bool     `json:"pinned"`
	PublishedAt string   `json:"publishedAt"`
	Meta        []string `json:"meta"`
}

type SectionSummary struct {
	Section string        `json:"section"`
	Label   string        `json:"label"`
	Count   int           `json:"count"`
	Items   []ContentItem `json:"items"`
}

type HomeResponse struct {
	GeneratedAt string           `json:"generatedAt"`
	Sections    []SectionSummary `json:"sections"`
	Pinned      []ContentItem    `json:"pinned"`
	Latest      []ContentItem    `json:"latest"`
}

type ContentResponse struct {
	Section string        `json:"section"`
	Label   string        `json:"label"`
	Items   []ContentItem `json:"items"`
}

var SectionLabels = map[string]string{
	"briefs":        "今日公司简报",
	"announcements": "公司公告墙",
	"forum":         "员工论坛热帖",
	"newcomer":      "新人专区",
	"finance":       "财经轻资讯",
	"documents":     "文档中心",
	"training":      "培训中心",
}

var SectionOrder = []string{"briefs", "announcements", "forum", "newcomer", "finance", "documents", "training"}
