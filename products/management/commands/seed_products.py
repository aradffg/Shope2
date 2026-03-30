"""
Management command to seed the database with sample product data.
Usage: python manage.py seed_products
"""

from django.core.management.base import BaseCommand
from products.models import Category, Product


class Command(BaseCommand):
    help = "Seeds the database with sample categories and products"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding database...")

        # ── Categories ──
        categories_data = [
            {"name": "Phones", "slug": "phones", "icon": "📱"},
            {"name": "Laptops", "slug": "laptops", "icon": "💻"},
            {"name": "Accessories", "slug": "accessories", "icon": "🎧"},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults=cat_data,
            )
            categories[cat.slug] = cat
            status = "✅ Created" if created else "⏭️  Exists"
            self.stdout.write(f"  {status}: Category '{cat.name}'")

        # ── Products ──
        products_data = [
            {
                "title": "Nova Pro Max",
                "slug": "nova-pro-max",
                "description": "Experience the next generation of mobile technology. The Nova Pro Max features a stunning 6.7-inch OLED display with 120Hz ProMotion, an A18 Bionic chip for unmatched performance, and a revolutionary 48MP triple camera system. All-day battery life meets premium titanium design.",
                "price": "1199.00",
                "image": "products/phone-1.png",
                "category": categories["phones"],
                "featured": True,
            },
            {
                "title": "Eclipse Ultra",
                "slug": "eclipse-ultra",
                "description": "The Eclipse Ultra redefines what a smartphone can be. With its edge-to-edge midnight display, 200MP main camera, and Snapdragon 8 Gen 4 processor, it delivers desktop-class performance in your pocket. Fast wireless charging gets you to 100% in under 30 minutes.",
                "price": "999.00",
                "image": "products/phone-2.png",
                "category": categories["phones"],
                "featured": True,
            },
            {
                "title": "AeroBook Pro 16",
                "slug": "aerobook-pro-16",
                "description": "Crafted from a single block of recycled aluminum, the AeroBook Pro 16 is as beautiful as it is powerful. Featuring the M4 Pro chip, 32GB unified memory, and a breathtaking 16-inch Liquid Retina XDR display. Up to 22 hours of battery life for all-day productivity.",
                "price": "2499.00",
                "image": "products/laptop-1.png",
                "category": categories["laptops"],
                "featured": True,
            },
            {
                "title": "Titan Gaming X",
                "slug": "titan-gaming-x",
                "description": "Dominate every game with the Titan Gaming X. Powered by an Intel Core i9 and NVIDIA RTX 5080, this beast handles anything you throw at it. The 240Hz display ensures buttery-smooth gameplay, while the advanced cooling system keeps temperatures in check.",
                "price": "2899.00",
                "image": "products/laptop-2.png",
                "category": categories["laptops"],
                "featured": True,
            },
            {
                "title": "CloudPods Max",
                "slug": "cloudpods-max",
                "description": "Immerse yourself in studio-quality sound with CloudPods Max. Premium over-ear headphones with Active Noise Cancellation, Spatial Audio, and 40 hours of battery life. The breathable mesh canopy and memory foam ear cushions ensure all-day comfort.",
                "price": "549.00",
                "image": "products/headphones-1.png",
                "category": categories["accessories"],
                "featured": True,
            },
            {
                "title": "Pulse Watch Ultra",
                "slug": "pulse-watch-ultra",
                "description": "Your ultimate health and fitness companion. The Pulse Watch Ultra features advanced health sensors, GPS, cellular connectivity, and a stunning always-on Retina display. Water resistant to 100m with up to 72 hours of battery life.",
                "price": "799.00",
                "image": "products/smartwatch-1.png",
                "category": categories["accessories"],
                "featured": True,
            },
            {
                "title": "SonicBuds Pro",
                "slug": "sonicbuds-pro",
                "description": "Tiny but mighty. The SonicBuds Pro deliver rich, detailed sound with Adaptive ANC that adjusts to your environment. Personalized Spatial Audio, sweat and water resistance, and 30 hours of total listening time with the charging case.",
                "price": "249.00",
                "image": "products/earbuds-1.png",
                "category": categories["accessories"],
                "featured": False,
            },
            {
                "title": "VisionPad Air",
                "slug": "visionpad-air",
                "description": "The ultimate canvas for creativity and productivity. The VisionPad Air features an 11-inch Liquid Retina display, M3 chip, and support for Pencil Pro. Incredibly thin at just 6.1mm and weighing under a pound, it goes wherever inspiration strikes.",
                "price": "699.00",
                "image": "products/tablet-1.png",
                "category": categories["phones"],
                "featured": False,
            },
        ]

        for prod_data in products_data:
            product, created = Product.objects.get_or_create(
                slug=prod_data["slug"],
                defaults=prod_data,
            )
            status = "✅ Created" if created else "⏭️  Exists"
            self.stdout.write(f"  {status}: Product '{product.title}'")

        self.stdout.write(self.style.SUCCESS("\n🎉 Database seeding complete!"))
