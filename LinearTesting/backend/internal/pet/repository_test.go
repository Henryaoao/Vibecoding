package pet

import (
	"context"
	"errors"
	"testing"
)

func TestMemoryRepository_CreateAndFindPet(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	repo := NewMemoryRepository()

	team, err := repo.CreateTeam(ctx, " Product ")
	if err != nil {
		t.Fatalf("CreateTeam error = %v", err)
	}
	if team.Name != "Product" {
		t.Fatalf("team.Name = %q, want %q", team.Name, "Product")
	}

	created, err := repo.CreatePet(ctx, team.ID, " Sprout ", " mint-bean ")
	if err != nil {
		t.Fatalf("CreatePet error = %v", err)
	}
	if created.TeamID != team.ID {
		t.Fatalf("created.TeamID = %q, want %q", created.TeamID, team.ID)
	}
	if created.Name != "Sprout" {
		t.Fatalf("created.Name = %q, want %q", created.Name, "Sprout")
	}
	if created.Template != "mint-bean" {
		t.Fatalf("created.Template = %q, want %q", created.Template, "mint-bean")
	}
	if created.Level != 1 {
		t.Fatalf("created.Level = %d, want %d", created.Level, 1)
	}
	if created.GrowthValue != 0 {
		t.Fatalf("created.GrowthValue = %d, want %d", created.GrowthValue, 0)
	}

	found, err := repo.FindByTeamID(ctx, team.ID)
	if err != nil {
		t.Fatalf("FindByTeamID error = %v", err)
	}
	if found.ID != created.ID {
		t.Fatalf("found.ID = %q, want %q", found.ID, created.ID)
	}
}

func TestMemoryRepository_RejectsDuplicateTeamPet(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	repo := NewMemoryRepository()

	team, err := repo.CreateTeam(ctx, "Engineering")
	if err != nil {
		t.Fatalf("CreateTeam error = %v", err)
	}
	if _, err := repo.CreatePet(ctx, team.ID, "Sprout", "mint-bean"); err != nil {
		t.Fatalf("CreatePet first error = %v", err)
	}

	_, err = repo.CreatePet(ctx, team.ID, "Buddy", "sunny-bean")
	if !errors.Is(err, ErrPetAlreadyExist) {
		t.Fatalf("CreatePet duplicate error = %v, want %v", err, ErrPetAlreadyExist)
	}
}

func TestMemoryRepository_UpdateState(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	repo := NewMemoryRepository()

	team, err := repo.CreateTeam(ctx, "Engineering")
	if err != nil {
		t.Fatalf("CreateTeam error = %v", err)
	}
	created, err := repo.CreatePet(ctx, team.ID, "Sprout", "mint-bean")
	if err != nil {
		t.Fatalf("CreatePet error = %v", err)
	}

	created.Name = "Orbit"
	created.Template = "space-bean"
	created.Level = 3
	created.GrowthValue = 250
	created.Mood = "excited"
	created.CurrentSkin = "pilot"

	updated, err := repo.UpdateState(ctx, created)
	if err != nil {
		t.Fatalf("UpdateState error = %v", err)
	}
	if updated.TeamID != team.ID {
		t.Fatalf("updated.TeamID = %q, want %q", updated.TeamID, team.ID)
	}
	if updated.Level != 3 || updated.GrowthValue != 250 || updated.Mood != "excited" {
		t.Fatalf("updated state = level %d growth %d mood %q", updated.Level, updated.GrowthValue, updated.Mood)
	}

	found, err := repo.FindByTeamID(ctx, team.ID)
	if err != nil {
		t.Fatalf("FindByTeamID error = %v", err)
	}
	if found.Name != "Orbit" || found.CurrentSkin != "pilot" {
		t.Fatalf("found pet = name %q skin %q", found.Name, found.CurrentSkin)
	}
}

func TestMemoryRepository_UnknownTeam(t *testing.T) {
	t.Parallel()

	_, err := NewMemoryRepository().CreatePet(context.Background(), "missing", "Sprout", "mint-bean")
	if !errors.Is(err, ErrTeamNotFound) {
		t.Fatalf("CreatePet unknown team error = %v, want %v", err, ErrTeamNotFound)
	}
}
