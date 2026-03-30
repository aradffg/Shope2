"""
Views for the core app — Home, About, Contact pages.
"""

from django.shortcuts import render, redirect
from django.contrib import messages
from products.models import Product, Category
from .forms import ContactForm


def home(request):
    """Home page with featured products and category preview."""
    featured_products = Product.objects.filter(featured=True).select_related("category")[:8]
    categories = Category.objects.all()
    context = {
        "featured_products": featured_products,
        "categories": categories,
    }
    return render(request, "core/home.html", context)


def about(request):
    """About page with brand story."""
    return render(request, "core/about.html")


def contact(request):
    """Contact page with form handling."""
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thank you! Your message has been sent successfully.")
            return redirect("core:contact")
    else:
        form = ContactForm()

    return render(request, "core/contact.html", {"form": form})
