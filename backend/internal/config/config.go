package config

import (
	"deniska_runner/internal/db"
	"fmt"
	"os"
)

type Config struct {
	DB db.Config
}

func LoadConfig() (Config, error) {
	dbConfig, err := loadDBConfig()
	if err != nil {
		return Config{}, fmt.Errorf("failed to load database config: %w", err)
	}

	return Config{
		DB: dbConfig,
	}, nil
}

func loadDBConfig() (db.Config, error) {
	requiredEnvVars := map[string]string{
		"DB_HOST":     "",
		"DB_PORT":     "",
		"DB_USER":     "",
		"DB_PASSWORD": "",
		"DB_NAME":     "",
	}

	var missingVars []string
	for envVar := range requiredEnvVars {
		if value := os.Getenv(envVar); value != "" {
			requiredEnvVars[envVar] = value
		} else {
			missingVars = append(missingVars, envVar)
		}
	}

	if len(missingVars) > 0 {
		return db.Config{}, fmt.Errorf("missing required environment variables: %v", missingVars)
	}

	return db.Config{
		Host:     requiredEnvVars["DB_HOST"],
		Port:     requiredEnvVars["DB_PORT"],
		User:     requiredEnvVars["DB_USER"],
		Password: requiredEnvVars["DB_PASSWORD"],
		DBName:   requiredEnvVars["DB_NAME"],
		SSLMode:  getEnvWithDefault("DB_SSLMODE", "disable"),
	}, nil
}

func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
