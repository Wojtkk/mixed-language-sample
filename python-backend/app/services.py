"""Business logic services."""
from typing import List, Optional
from .models import User, UserRepository

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
        self.next_id = 1
    
    def create_user(self, username: str, email: str) -> Optional[User]:
        if not username or not email:
            return None
        
        existing = self.user_repo.find_by_email(email)
        if existing:
            return None
        
        user = User(id=self.next_id, username=username, email=email)
        self.user_repo.add_user(user)
        self.next_id += 1
        return user
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.user_repo.find_by_id(user_id)
    
    def get_all_users(self) -> List[User]:
        return self.user_repo.users
    
    def delete_user(self, user_id: int) -> bool:
        user = self.user_repo.find_by_id(user_id)
        if user:
            self.user_repo.users.remove(user)
            return True
        return False

class EmailService:
    def send_welcome_email(self, email: str) -> bool:
        print(f"Sending welcome email to {email}")
        return True
    
    def send_notification(self, email: str, message: str) -> bool:
        print(f"Sending notification to {email}: {message}")
        return True
