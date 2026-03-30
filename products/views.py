"""
Views for the products app — product listing and detail pages.
"""

from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from .models import Product, Category, Review
from .forms import ReviewForm


def product_list(request):
    """Display all products with optional category filtering and search."""
    categories = Category.objects.all()
    products = Product.objects.select_related("category").all()

    # Search filter
    query = request.GET.get('q')
    if query:
        products = products.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query) |
            Q(category__name__icontains=query)
        )

    # Filter by category if query param is present
    category_slug = request.GET.get("category")
    active_category = None
    if category_slug:
        active_category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=active_category)

    context = {
        "products": products,
        "categories": categories,
        "active_category": active_category,
        "search_query": query,
    }
    return render(request, "products/product_list.html", context)


def product_detail(request, slug):
    """Display a single product's details and handle reviews."""
    product = get_object_or_404(
        Product.objects.select_related("category").prefetch_related('reviews'),
        slug=slug
    )
    
    # Handle Review Post
    if request.method == 'POST' and request.user.is_authenticated:
        review_form = ReviewForm(request.POST)
        if review_form.is_valid():
            review = review_form.save(commit=False)
            review.product = product
            review.user = request.user
            review.save()
            return redirect('products:product_detail', slug=product.slug)
    else:
        review_form = ReviewForm()

    # Get related products from same category (exclude current)
    related_products = Product.objects.filter(
        category=product.category
    ).exclude(pk=product.pk)[:4]
    
    # Check if in wishlist
    in_wishlist = False
    if request.user.is_authenticated:
        if product.users_wishlist.filter(id=request.user.id).exists():
            in_wishlist = True

    context = {
        "product": product,
        "related_products": related_products,
        "review_form": review_form,
        "in_wishlist": in_wishlist,
    }
    return render(request, "products/product_detail.html", context)


@login_required
def toggle_wishlist(request, product_id):
    """AJAX view to toggle a product in the user's wishlist."""
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        if product.users_wishlist.filter(id=request.user.id).exists():
            product.users_wishlist.remove(request.user)
            added = False
        else:
            product.users_wishlist.add(request.user)
            added = True
        return JsonResponse({'success': True, 'added': added})
    return JsonResponse({'success': False}, status=400)
