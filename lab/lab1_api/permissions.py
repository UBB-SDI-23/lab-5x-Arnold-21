from rest_framework.permissions import BasePermission

# This class defines permission rules for regular, moderator, and admin users in a Django application.
class isRegular(BasePermission):
    def has_permission(self, request, view):
        """
        This function checks if the user making the request has a role of "Regular", "Moderator", or
        "Admin".
        
        :param request: The request object represents the HTTP request that the user has made to the
        server. It contains information about the request, such as the HTTP method used (GET, POST,
        etc.), the headers, and any data that was sent with the request
        :param view: The view parameter refers to the view function or class-based view that is being
        accessed by the user. It is used in the has_permission method to determine whether the user has
        the necessary permissions to access the view
        :return: a boolean value indicating whether the user making the request has permission to access
        the view. The permission is granted if the user's role is "Regular", "Moderator", or "Admin".
        """
        return request.user.role == "Regular" or request.user.role == "Moderator" or request.user.role == "Admin"  
    
    def has_object_permission(self, request, view, obj):
        """
        This function checks if a user has permission to access an object based on their role and if
        they are the owner of the object.
        
        :param request: The request object represents the HTTP request that the user has made to the
        server. It contains information such as the user's authentication status, the HTTP method used
        (GET, POST, etc.), and any data that was sent with the request
        :param view: The view parameter refers to the view function or class-based view that is being
        accessed by the user. It contains information about the HTTP request, such as the request method
        (GET, POST, etc.), the request data, and the URL parameters
        :param obj: The "obj" parameter in this function refers to the object that the user is trying to
        access or modify. It could be any object that the view is dealing with, such as a model instance
        or a queryset. The function checks whether the user has permission to perform the requested
        action on this object
        :return: a boolean value indicating whether the user making the request has permission to access
        the object being requested. The conditions for permission are:
        """
        return (request.user.role == "Regular" and obj.user == request.user) or request.user.role == "Moderator" or request.user.role == "Admin" 
    
# This class checks if the user has the role of "Moderator" or "Admin" to grant permission.
class isModerator(BasePermission):
    def has_permission(self, request, view):
        """
        This function checks if the user making the request has the role of "Moderator" or "Admin".
        
        :param request: The HTTP request object that contains information about the incoming request,
        such as the user making the request, the HTTP method used, and any data sent with the request
        :param view: The view parameter refers to the view function or class-based view that is being
        accessed by the user. It contains information about the request and the response that the view
        will generate
        :return: a boolean value indicating whether the user making the request has the permission to
        access the view. The user has permission if their role is either "Moderator" or "Admin".
        """
        return request.user.role == "Moderator" or request.user.role == "Admin"
    
# This is a custom permission class in Django REST Framework that checks if the user has the "Admin"
# role.
class isAdmin(BasePermission):
    def has_permission(self, request, view):
        """
        This function checks if the user making the request has the role of "Admin".
        
        :param request: The HTTP request object that contains information about the incoming request,
        such as the user making the request, the HTTP method used, and any data sent with the request
        :param view: The view parameter refers to the view function or class-based view that is being
        accessed by the user. It contains information about the request and the response that will be
        sent back to the user
        :return: a boolean value indicating whether the user making the request has the "Admin" role or
        not. If the user has the "Admin" role, the function will return True, otherwise it will return
        False.
        """
        return request.user.role == "Admin" 