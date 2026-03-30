from .cart import Cart

def cart(request):
    """
    Instantiate the cart and make it available in all templates globally.
    """
    return {'cart': Cart(request)}
