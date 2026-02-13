import { User } from './User';

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getUsers(): Promise<User[]> {
        const response = await fetch(`${this.baseUrl}/users`);
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return response.json();
    }

    async getUser(userId: number): Promise<User> {
        const response = await fetch(`${this.baseUrl}/users/${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch user ${userId}`);
        }
        return response.json();
    }

    async createUser(username: string, email: string): Promise<User> {
        const response = await fetch(`${this.baseUrl}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email }),
        });

        if (!response.ok) {
            throw new Error('Failed to create user');
        }
        return response.json();
    }

    async deleteUser(userId: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Failed to delete user ${userId}`);
        }
    }
}
