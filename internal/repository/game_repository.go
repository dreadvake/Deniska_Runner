package repository

import (
	"context"
	"database/sql"
	"deniska_runner/internal/models"
)

type GameRepository interface {
	Create(ctx context.Context, score *models.Score) error
	GetLeaderboard(ctx context.Context, score *models.Score) ([]*models.User, error)
	Update(ctx context.Context, score *models.Score) error
	Delete(ctx context.Context, score *models.Score) error
}

type GameRepositoryDB struct {
	db *sql.DB
}

func NewGameRepositoryDB(db *sql.DB) *GameRepositoryDB {
	return &GameRepositoryDB{db: db}
}

func (r *GameRepositoryDB) Create(ctx context.Context, score *models.Score) error {
	return nil
}
