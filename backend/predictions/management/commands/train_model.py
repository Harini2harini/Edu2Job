from django.core.management.base import BaseCommand
import os
import sys

class Command(BaseCommand):
    help = 'Train the job prediction ML model'
    
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Training job prediction model...'))
        
        # Add ml_model to path
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        ml_model_path = os.path.join(base_dir, 'ml_model')
        sys.path.append(ml_model_path)
        
        try:
            from ml_model.train_model import train_initial_model
            
            predictor, accuracy = train_initial_model()
            
            if predictor:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Model trained successfully with accuracy: {accuracy:.2%}')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('❌ Model training failed')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {str(e)}')
            )