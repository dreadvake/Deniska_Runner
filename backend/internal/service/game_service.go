package service

import (
	"context"
	"deniska_runner/internal/models"
	"deniska_runner/internal/repository"
	"errors"
)

type GameServicer interface {
	SaveScore(ctx context.Context, score *models.Score) error
	GetLeaderboard(ctx context.Context, game string) ([]*models.User, error)
}

type GameService struct {
	repo repository.GameRepository
}

func NewGameService(repo repository.GameRepository) *GameService {
	return &GameService{repo: repo}
}

func (s *GameService) SaveScore(ctx context.Context, score *models.Score) error {
	//if score.UserName == "" || score.Game == "" {
	//	return errors.New("username and game are required")
	//}
	return s.repo.Create(ctx, score)
}

func (s *GameService) GetLeaderboard(ctx context.Context, game string) ([]*models.User, error) {
	if game == "" {
		return nil, errors.New("game is required")
	}
	score := &models.Score{Game: game}
	return s.repo.GetLeaderboard(ctx, score)
}
