export interface User {
    id: number;
    username: string;
    email: string;
}

export class UserValidator {
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidUsername(username: string): boolean {
        return username.length >= 3 && username.length <= 20;
    }

    static validateUser(user: Partial<User>): string[] {
        const errors: string[] = [];

        if (!user.username) {
            errors.push('Username is required');
        } else if (!this.isValidUsername(user.username)) {
            errors.push('Username must be 3-20 characters');
        }

        if (!user.email) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(user.email)) {
            errors.push('Invalid email format');
        }

        return errors;
    }
}
