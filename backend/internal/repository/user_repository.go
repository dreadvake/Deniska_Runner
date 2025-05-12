package repository

import (
	"context"
	"database/sql"
	"deniska_runner/internal/models"
	"errors"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, username string) error
	Login(ctx context.Context, username, password string) (*models.User, error)
}

type userRepositoryDB struct {
	db *sql.DB
}

func NewUserRepositoryDB(db *sql.DB) UserRepository {
	return &userRepositoryDB{db: db}
}

func (u *userRepositoryDB) Create(ctx context.Context, user *models.User) error {

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	query := `
		INSERT INTO users (username, email, password, created_at, updated_at) 
		VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		RETURNING id, created_at, updated_at`
	err = u.db.QueryRowContext(ctx, query,
		user.Name,
		user.Email,
		string(hashedPassword)).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err.Error() == `pq: duplicate key value violates unique constraint "users_username_key"` {
			return errors.New("user already exists")
		}
		return err
	}
	return nil
}

func (u *userRepositoryDB) Update(ctx context.Context, user *models.User) error {
	var PasswordHash string
	var err error
	if user.Password != "" {
		hashedPasswordBytes, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		PasswordHash = string(hashedPasswordBytes)
	} else {
		var currentPassword string
		err := u.db.QueryRowContext(ctx, `SELECT password FROM users WHERE username = $1`, user.Name).
			Scan(&currentPassword)
		if err != nil {
			return err
		}
		PasswordHash = currentPassword
	}
	query := `
		UPDATE users 
		SET username = $1, email = $2, password = $3,
		updated_at = CURRENT_TIMESTAMP
		WHERE ID = $4`
	result, err := u.db.ExecContext(ctx, query,
		user.Name, user.Email, PasswordHash, user.ID)

	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (u *userRepositoryDB) Delete(ctx context.Context, username string) error {
	query := `DELETE FROM users WHERE username = $1`
	result, err := u.db.ExecContext(ctx, query, username)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (u *userRepositoryDB) Login(ctx context.Context, username, password string) (*models.User, error) {
	var user models.User
	var PasswordHash []byte
	query := `
		SELECT id, username, email, password
		FROM users 
		WHERE username = $1`
	err := u.db.QueryRowContext(ctx, query, username).
		Scan(&user.ID, &user.Name, &user.Email, &PasswordHash)
	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	if err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword(PasswordHash, []byte(password)); err != nil {
		return nil, errors.New("invalid password")
	}
	return &user, nil
}
