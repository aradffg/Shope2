from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm

def register(request):
    """
    Handle user registration.
    """
    if request.user.is_authenticated:
        return redirect('users:dashboard')
        
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Log the user in upon successful registration
            login(request, user)
            messages.success(request, f"Welcome to ElectroStore, {user.first_name}!")
            return redirect('users:dashboard')
        else:
            for error in list(form.errors.values()):
                messages.error(request, error)
    else:
        form = CustomUserCreationForm()
        
    return render(request, 'users/register.html', {'form': form})

@login_required
def dashboard(request):
    """
    User dashboard showing profile and past orders.
    """
    orders = request.user.orders.all()
    return render(request, 'users/dashboard.html', {'orders': orders})
