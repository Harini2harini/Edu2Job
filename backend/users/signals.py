from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Import inside function to avoid circular import
        from profiles.models import UserProfile
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        # Import inside function to avoid circular import
        from profiles.models import UserProfile
        instance.user_profile.save()
    except UserProfile.DoesNotExist:
        # Create if doesn't exist
        from profiles.models import UserProfile
        UserProfile.objects.create(user=instance)
    except Exception:
        # Skip if other error
        pass