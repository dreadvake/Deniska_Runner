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
	query := `
        INSERT INTO scores (user_name, game, distance, money)
        VALUES ($1, $2, $3, $4)
    `
	_, err := r.db.ExecContext(ctx, query,
		score.UserName,
		score.Game,
		score.Points.Distance,
		score.Points.Money,
	)
	return err
}

func (r *GameRepositoryDB) GetLeaderboard(ctx context.Context, score *models.Score) ([]*models.User, error) {
	query := `
        SELECT u.id, u.username, u.email, s.distance, s.money
        FROM users u
        JOIN scores s ON u.username = s.user_name
        WHERE s.game = $1
        ORDER BY s.distance DESC, s.money DESC
        LIMIT 10
    `

	rows, err := r.db.QueryContext(ctx, query, score.Game)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&score.Points.Distance,
			&score.Points.Money,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (r *GameRepositoryDB) Update(ctx context.Context, score *models.Score) error {
	query := `
        UPDATE scores 
        SET distance = $1, money = $2
        WHERE user_name = $3 AND game = $4
    `
	_, err := r.db.ExecContext(ctx, query,
		score.Points.Distance,
		score.Points.Money,
		score.UserName,
		score.Game,
	)
	return err
}

func (r *GameRepositoryDB) Delete(ctx context.Context, score *models.Score) error {
	query := `
        DELETE FROM scores
        WHERE user_name = $1 AND game = $2
    `
	_, err := r.db.ExecContext(ctx, query,
		score.UserName,
		score.Game,
	)
	return err
}
