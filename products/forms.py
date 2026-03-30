from django import forms
from .models import Review

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['rating', 'comment']
        widgets = {
            'rating': forms.Select(choices=[(i, f"{i} Stars") for i in range(5, 0, -1)], attrs={'class': 'form__input'}),
            'comment': forms.Textarea(attrs={'class': 'form__input', 'rows': 4, 'placeholder': 'Share your thoughts about this product...'}),
        }
