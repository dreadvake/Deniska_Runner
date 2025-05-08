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
		INSERT INTO users (username, email, password) 
		VALUES ($1, $2, $3) 
		RETURNING id`
	err = u.db.QueryRowContext(ctx, query,
		user.Name, user.Email, user.Password, user.Email, string(hashedPassword)).
		Scan(&user.ID)
	if err != nil {
		if err.Error() == `pq: duplicate key value violates unique constraint "users_username_key"` {
			return errors.New("user already exists")
		}
		return err
	}
	return nil
}

func (u *userRepositoryDB) Update(ctx context.Context, user *models.User) error {
	var hashedPassword string
	var err error
	if user.Password != "" {
		hashedPasswordBytes, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		hashedPassword = string(hashedPasswordBytes)
	} else {
		var currentPassword string
		err := u.db.QueryRowContext(ctx, `SELECT password FROM users WHERE username = $1`, user.Name).
			Scan(&currentPassword)
		if err != nil {
			return err
		}
		hashedPassword = currentPassword
	}
	query := `
		UPDATE users 
		SET username = $1, email = $2, password = $3, HashPassword = $4
		WHERE ID = $5`
	result, err := u.db.ExecContext(ctx, query,
		user.Name, user.Email, user.Password, hashedPassword, user.ID)
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
	var hashedPassword string
	query := `
		SELECT id, username, email, password, HashPassword 
		FROM users 
		WHERE username = $1`
	err := u.db.QueryRowContext(ctx, query, username).
		Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.HashPassword)
	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	if err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return nil, errors.New("invalid password")
	}
	return &user, nil
}
