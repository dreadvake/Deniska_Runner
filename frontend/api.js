// api.js
const API_URL = '/api';

export const api = {
    async login(username, password) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: username,
                password: password
            })

        });
        return response.json();
    },

    async register(username, password, email) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: username,
                password: password,
                email: email
            })

        });
        return response.json();
    },

    async getScore() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/score`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },


    // async login(username, password) {
    //     const response = await fetch(`${API_URL}/user/login`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ username, password }),
    //     });
    //     if (!response.ok) throw new Error('Login failed');
    //     return response.json();
    // },

    async saveScore(score) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(score),
        });
        if (!response.ok) throw new Error('Failed to save score');
        return response.json();
    },

    async getLeaderboard() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/leaderboard?game=runner`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to get leaderboard');
        return response.json();
    }
};