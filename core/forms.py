"""
Forms for the core app.
"""

from django import forms
from .models import ContactMessage


class ContactForm(forms.ModelForm):
    """Contact form with styled widgets."""

    class Meta:
        model = ContactMessage
        fields = ["name", "email", "message"]
        widgets = {
            "name": forms.TextInput(attrs={
                "placeholder": "Your Name",
                "id": "contact-name",
                "autocomplete": "name",
            }),
            "email": forms.EmailInput(attrs={
                "placeholder": "your@email.com",
                "id": "contact-email",
                "autocomplete": "email",
            }),
            "message": forms.Textarea(attrs={
                "placeholder": "Tell us what's on your mind...",
                "id": "contact-message",
                "rows": 5,
            }),
        }
