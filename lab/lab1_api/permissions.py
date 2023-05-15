from rest_framework.permissions import BasePermission

class isRegular(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "Regular" or request.user.role == "Moderator" or request.user.role == "Admin"  
    
    def has_object_permission(self, request, view, obj):
        return (request.user.role == "Regular" and obj.user == request.user) or request.user.role == "Moderator" or request.user.role == "Admin" 
    
class isModerator(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "Moderator" or request.user.role == "Admin"
    
class isAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "Admin" 