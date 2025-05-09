-- +goose Up
CREATE TABLE IF NOT EXISTS users (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    hashpassword VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                             );

CREATE TABLE IF NOT EXISTS scores (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
    game VARCHAR(50) NOT NULL,
    distance INTEGER NOT NULL DEFAULT 0,
    money INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                                                         );

CREATE INDEX IF NOT EXISTS idx_scores_game ON scores(game);
CREATE INDEX IF NOT EXISTS idx_scores_user_name ON scores(user_name);

-- +goose Down
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS users;