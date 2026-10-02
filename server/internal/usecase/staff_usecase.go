package usecase

import (
	"context"
	"fmt"
	"strings"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
	"mkcosmetics/server/internal/infrastructure/persistence/sqlite"
)

type StaffUseCase struct {
	userRepo  repository.UserRepository
	orderRepo repository.OrderRepository
}

func NewStaffUseCase(userRepo repository.UserRepository, orderRepo repository.OrderRepository) *StaffUseCase {
	return &StaffUseCase{
		userRepo:  userRepo,
		orderRepo: orderRepo,
	}
}

type CreateStaffInput struct {
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Phone       string `json:"phone"`
	Password    string `json:"password"`
	Role        string `json:"role"` // 'admin', 'manager', 'logistics'
	IsActive    bool   `json:"isActive"`
}

type StaffMemberResponse struct {
	ID          int64  `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Phone       string `json:"phone"`
	Role        string `json:"role"`
	IsActive    bool   `json:"isActive"`
	OrdersCount int    `json:"ordersCount"`
	PaidCount   int    `json:"paidCount"`
}

func (uc *StaffUseCase) GetAllStaff(ctx context.Context) ([]*StaffMemberResponse, error) {
	users, err := uc.userRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	orders, _, _ := uc.orderRepo.FindAll(ctx, "", "", 1000, 0)
	orderCounts := make(map[string]int)
	paidCounts := make(map[string]int)

	for _, o := range orders {
		assigned := o.AssignedTo
		if assigned == "" {
			assigned = "admin"
		}
		orderCounts[assigned]++
		if o.Status == "paid" || o.Status == "shipped" || o.Status == "delivered" {
			paidCounts[assigned]++
		}
	}

	var res []*StaffMemberResponse
	for _, u := range users {
		dName := u.DisplayName
		if dName == "" {
			dName = u.Username
		}
		res = append(res, &StaffMemberResponse{
			ID:          u.ID,
			Username:    u.Username,
			DisplayName: dName,
			Phone:       u.Phone,
			Role:        u.Role,
			IsActive:    u.IsActive,
			OrdersCount: orderCounts[u.Username],
			PaidCount:   paidCounts[u.Username],
		})
	}
	return res, nil
}

func (uc *StaffUseCase) CreateStaff(ctx context.Context, input CreateStaffInput) (*entity.User, error) {
	username := strings.TrimSpace(input.Username)
	if username == "" {
		return nil, fmt.Errorf("username is required")
	}
	if len(input.Password) < 4 {
		return nil, fmt.Errorf("password must be at least 4 characters")
	}

	existing, _ := uc.userRepo.FindByUsername(ctx, username)
	if existing != nil {
		return nil, fmt.Errorf("user with username '%s' already exists", username)
	}

	hash, err := sqlite.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	role := input.Role
	if role == "" {
		role = "manager"
	}

	user := &entity.User{
		Username:     username,
		DisplayName:  input.DisplayName,
		Phone:        input.Phone,
		PasswordHash: hash,
		Role:         role,
		IsActive:     input.IsActive,
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (uc *StaffUseCase) UpdateStaff(ctx context.Context, id int64, input CreateStaffInput) error {
	user, err := uc.userRepo.FindByID(ctx, id)
	if err != nil || user == nil {
		return fmt.Errorf("user not found")
	}

	user.DisplayName = input.DisplayName
	user.Phone = input.Phone
	user.Role = input.Role
	user.IsActive = input.IsActive

	if err := uc.userRepo.Update(ctx, user); err != nil {
		return err
	}

	if input.Password != "" && len(input.Password) >= 4 {
		hash, err := sqlite.HashPassword(input.Password)
		if err == nil {
			_ = uc.userRepo.UpdatePassword(ctx, id, hash)
		}
	}
	return nil
}

func (uc *StaffUseCase) DeleteStaff(ctx context.Context, id int64) error {
	return uc.userRepo.Delete(ctx, id)
}
