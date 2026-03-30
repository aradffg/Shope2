from django.shortcuts import render, redirect
from django.urls import reverse
from cart.cart import Cart
from .models import OrderItem, Order
from .forms import OrderCreateForm

def order_create(request):
    cart = Cart(request)
    if len(cart) == 0:
        return redirect('products:product_list')

    if request.method == 'POST':
        form = OrderCreateForm(request.POST)
        if form.is_valid():
            order = form.save(commit=False)
            if request.user.is_authenticated:
                order.user = request.user
            # Simulate payment processing as paid true
            order.paid = True
            order.save()
            
            for item in cart:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    price=item['price'],
                    quantity=item['quantity']
                )
            
            # clear the cart
            cart.clear()
            
            # redirect to success page
            request.session['order_id'] = order.id
            return redirect('orders:order_success')
    else:
        # Pre-fill form if user is authenticated
        initial = {}
        if request.user.is_authenticated:
            initial = {
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'email': request.user.email,
            }
        form = OrderCreateForm(initial=initial)
        
    return render(request, 'orders/checkout.html', {'cart': cart, 'form': form})

def order_success(request):
    order_id = request.session.get('order_id')
    if not order_id:
        return redirect('core:home')
    
    order = Order.objects.get(id=order_id)
    return render(request, 'orders/success.html', {'order': order})
