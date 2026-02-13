"""API routes."""
from flask import Blueprint, request, jsonify
from .models import User, UserRepository
from .services import UserService, EmailService

bp = Blueprint('api', __name__)
user_repo = UserRepository()
user_service = UserService(user_repo)
email_service = EmailService()

@bp.route('/users', methods=['GET'])
def get_users():
    users = user_service.get_all_users()
    return jsonify([u.to_dict() for u in users])

@bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = user_service.get_user_by_id(user_id)
    if user:
        return jsonify(user.to_dict())
    return jsonify({'error': 'User not found'}), 404

@bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = user_service.create_user(
        data.get('username'),
        data.get('email')
    )
    if user:
        email_service.send_welcome_email(user.email)
        return jsonify(user.to_dict()), 201
    return jsonify({'error': 'Invalid user data'}), 400

@bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    success = user_service.delete_user(user_id)
    if success:
        return '', 204
    return jsonify({'error': 'User not found'}), 404
