import React, { useState, useEffect } from 'react';
import { User, UserValidator } from './User';
import { ApiClient } from './ApiClient';

interface UserListProps {
    apiClient: ApiClient;
}

export const UserList: React.FC<UserListProps> = ({ apiClient }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        try {
            await apiClient.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Users</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.username} ({user.email})
                        <button onClick={() => handleDelete(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
