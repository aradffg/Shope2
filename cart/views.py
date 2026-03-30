from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST
from products.models import Product
from .cart import Cart

@require_POST
def cart_add(request, product_id):
    """AJAX view to add a product to the cart."""
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart.add(product=product, quantity=1)
    
    return JsonResponse({'success': True, 'cart_total_items': len(cart), 'cart_total_price': str(cart.get_total_price())})


@require_POST
def cart_update(request, product_id):
    """AJAX view to update a product's quantity in the cart."""
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    # The quantity is expected in the POST body, defaults to 1
    try:
        quantity = int(request.POST.get('quantity', 1))
    except ValueError:
        quantity = 1
        
    if quantity > 0:
        cart.add(product=product, quantity=quantity, override_quantity=True)
    else:
        cart.remove(product=product)
        
    return JsonResponse({'success': True, 'cart_total_items': len(cart), 'cart_total_price': str(cart.get_total_price())})


@require_POST
def cart_remove(request, product_id):
    """AJAX view to remove a product from the cart."""
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart.remove(product)
    
    return JsonResponse({'success': True, 'cart_total_items': len(cart), 'cart_total_price': str(cart.get_total_price())})


def cart_detail(request):
    """AJAX view to get the current cart contents to render the sliding drawer."""
    cart = Cart(request)
    items = []
    
    for item in cart:
        items.append({
            'product_id': item['product'].id,
            'title': item['product'].title,
            'price': str(item['price']),
            'quantity': item['quantity'],
            'total_price': str(item['total_price']),
            'image_url': item['product'].image.url if item['product'].image else ''
        })
        
    return JsonResponse({
        'items': items,
        'cart_total_items': len(cart),
        'cart_total_price': str(cart.get_total_price())
    })
