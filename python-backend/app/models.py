"""Database models."""
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class User:
    id: int
    username: str
    email: str
    
    def validate(self) -> bool:
        return bool(self.username and self.email)
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }

@dataclass
class Product:
    id: int
    name: str
    price: float
    stock: int
    
    def is_available(self) -> bool:
        return self.stock > 0
    
    def apply_discount(self, percentage: float) -> float:
        return self.price * (1 - percentage / 100)

class UserRepository:
    def __init__(self):
        self.users: List[User] = []
    
    def add_user(self, user: User) -> None:
        if user.validate():
            self.users.append(user)
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        for user in self.users:
            if user.id == user_id:
                return user
        return None
    
    def find_by_email(self, email: str) -> Optional[User]:
        for user in self.users:
            if user.email == email:
                return user
        return None
