package model

type CurrentUser struct {
	UserID        string `json:"userId"`
	Email         string `json:"email"`
	DisplayName   string `json:"displayName"`
	RoleCode      string `json:"roleCode"`
	Department    string `json:"department"`
	Title         string `json:"title"`
	AccountStatus string `json:"accountStatus"`
}

type TeamsUserIdentity struct {
	UserID      string
	TenantID    string
	Email       string
	DisplayName string
	AvatarURL   string
}
