package repository

import (
	"context"
	"database/sql"
	"deniska_runner/internal/models"
)

type GameRepository interface {
	Create(ctx context.Context, score *models.Score) error
	GetLeaderboard(ctx context.Context, score *models.Score) ([]*models.UserLeaderboard, error)
	Update(ctx context.Context, score *models.Score) error
	Delete(ctx context.Context, score *models.Score) error
}

type GameRepositoryDB struct {
	db *sql.DB
}

func NewGameRepositoryDB(db *sql.DB) *GameRepositoryDB {
	return &GameRepositoryDB{db: db}
}

func (r *GameRepositoryDB) getUserID(ctx context.Context, username string) (string, error) {
	const q = `SELECT id FROM users WHERE username = $1`
	var id string
	if err := r.db.QueryRowContext(ctx, q, username).Scan(&id); err != nil {
		return "", err
	}
	return id, nil
}

func (r *GameRepositoryDB) Create(ctx context.Context, score *models.Score) error {
	userID, err := r.getUserID(ctx, score.UserName)
	if err != nil {
		return err
	}

	const q = `
		INSERT INTO scores (user_id, game, distance, money)
		VALUES ($1, $2, $3, $4)	`
	_, err = r.db.ExecContext(ctx, q,
		userID,
		score.Game,
		score.Points.Distance,
		score.Points.Money,
	)
	return err
}

func (r *GameRepositoryDB) GetLeaderboard(ctx context.Context, score *models.Score) ([]*models.UserLeaderboard, error) {
	//Game := "runner"
	const q = `
		SELECT u.id, u.username, s.distance, s.money
		FROM users u
		JOIN scores s ON u.id = s.user_id
		WHERE s.game = $1
		ORDER BY s.distance DESC, s.money DESC
		LIMIT 10
	`
	rows, err := r.db.QueryContext(ctx, q, score.Game)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users = make([]*models.UserLeaderboard, 0)
	for rows.Next() {
		user := &models.UserLeaderboard{}
		if err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Points.Distance,
			&user.Points.Money,
		); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (r *GameRepositoryDB) Update(ctx context.Context, score *models.Score) error {
	userID, err := r.getUserID(ctx, score.UserName)
	if err != nil {
		return err
	}
	const q = `
		UPDATE scores
		SET distance = $1, money = $2
		WHERE user_id = $3 AND game = $4
	`
	_, err = r.db.ExecContext(ctx, q,
		score.Points.Distance,
		score.Points.Money,
		userID,
		score.Game,
	)
	return err
}

func (r *GameRepositoryDB) Delete(ctx context.Context, score *models.Score) error {
	userID, err := r.getUserID(ctx, score.UserName)
	if err != nil {
		return err
	}
	const q = `
		DELETE FROM scores
		WHERE user_id = $1 AND game = $2
	`
	_, err = r.db.ExecContext(ctx, q, userID, score.Game)
	return err
}
