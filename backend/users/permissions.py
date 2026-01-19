from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsAdminOrModerator(permissions.BasePermission):
    """
    Allows access to admin and moderator users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                   request.user.role in ['admin', 'moderator'])

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access to object owner or admin users.
    """
    def has_object_permission(self, request, view, obj):
        # Check if user is admin
        if request.user.role == 'admin':
            return True
        
        # Check if user is the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'id'):
            return obj.id == request.user.id
        
        return False