package wallet

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"aoa-user-mvp/backend/internal/user"

	"github.com/gin-gonic/gin"
)

func TestCurrentWalletRequiresAuthentication(t *testing.T) {
	t.Parallel()

	router := gin.New()
	RegisterRoutes(router, NewService(NewMemoryRepository()), walletFakeAuthenticator{})

	response := performWalletRequest(router, http.MethodGet, "/api/wallet/me", "")
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusUnauthorized)
	}
}

func TestCurrentWalletReturnsZeroWalletWhenMissing(t *testing.T) {
	t.Parallel()

	router := gin.New()
	RegisterRoutes(router, NewService(NewMemoryRepository()), walletFakeAuthenticator{allow: true})

	response := performWalletRequest(router, http.MethodGet, "/api/wallet/me", "token")
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body=%s", response.Code, http.StatusOK, response.Body.String())
	}

	var parsed struct {
		Data struct {
			Wallet Wallet `json:"wallet"`
		} `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &parsed); err != nil {
		t.Fatal(err)
	}
	if parsed.Data.Wallet.UserID != "usr_000001" {
		t.Fatalf("wallet user = %q, want usr_000001", parsed.Data.Wallet.UserID)
	}
	if parsed.Data.Wallet.FeedBalance != 0 || parsed.Data.Wallet.EnergyBalance != 0 {
		t.Fatalf("wallet balances = feed %d energy %d, want zero", parsed.Data.Wallet.FeedBalance, parsed.Data.Wallet.EnergyBalance)
	}
}

func TestCurrentWalletReturnsBalances(t *testing.T) {
	t.Parallel()

	service := NewService(NewMemoryRepository())
	if _, details, err := service.Credit(
		context.Background(),
		"usr_000001",
		ResourceFeed,
		2,
		"test reward",
		"task_claim",
		"claim_000001",
	); err != nil {
		t.Fatalf("Credit error = %v; details = %v", err, details)
	}

	router := gin.New()
	RegisterRoutes(router, service, walletFakeAuthenticator{allow: true})

	response := performWalletRequest(router, http.MethodGet, "/api/wallet/me", "token")
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body=%s", response.Code, http.StatusOK, response.Body.String())
	}
	if !json.Valid(response.Body.Bytes()) {
		t.Fatalf("response is not valid JSON: %s", response.Body.String())
	}
	if !containsBytes(response.Body.Bytes(), []byte(`"feed_balance":2`)) {
		t.Fatalf("response should include feed balance: %s", response.Body.String())
	}
}

type walletFakeAuthenticator struct {
	allow bool
}

func (a walletFakeAuthenticator) CurrentUser(context.Context, string) (user.User, error) {
	if !a.allow {
		return user.User{}, errors.New("unauthorized")
	}
	return user.User{ID: "usr_000001", Email: "user@example.com", Username: "user"}, nil
}

func performWalletRequest(router *gin.Engine, method string, path string, token string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(method, path, nil)
	if token != "" {
		request.Header.Set("Authorization", "Bearer "+token)
	}
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	return response
}

func containsBytes(haystack []byte, needle []byte) bool {
	for i := 0; i <= len(haystack)-len(needle); i++ {
		if string(haystack[i:i+len(needle)]) == string(needle) {
			return true
		}
	}
	return false
}
