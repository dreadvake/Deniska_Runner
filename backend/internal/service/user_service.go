package service

import (
	"context"
	"deniska_runner/internal/models"
	"deniska_runner/internal/repository"
	"errors"
)

type UserServicer interface {
	CreateUser(ctx context.Context, user *models.User) error
	UpdateUser(ctx context.Context, user *models.User) error
	DeleteUser(ctx context.Context, username string) error
	LoginUser(ctx context.Context, username, password string) (*models.User, error)
}

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) CreateUser(ctx context.Context, user *models.User) error {
	if user.Name == "" || user.Password == "" {
		return errors.New("username and password are required")
	}
	return s.repo.Create(ctx, user)
}

func (s *UserService) UpdateUser(ctx context.Context, user *models.User) error {
	if user.Name == "" {
		return errors.New("username is required")
	}
	return s.repo.Update(ctx, user)
}

func (s *UserService) DeleteUser(ctx context.Context, username string) error {
	if username == "" {
		return errors.New("username is required")
	}
	return s.repo.Delete(ctx, username)
}

func (s *UserService) LoginUser(ctx context.Context, username, password string) (*models.User, error) {
	if username == "" || password == "" {
		return nil, errors.New("username and password are required")
	}
	return s.repo.Login(ctx, username, password)
}
